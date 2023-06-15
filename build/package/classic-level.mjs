import Chalk from "chalk";
import { ClassicLevel } from "classic-level";
import { cleanPackEntry } from "./clean.mjs";
import getSubfolderName from "./folders.mjs";
import { closeSync, existsSync, openSync, mkdirSync } from "node:fs";
import { rm, writeFile } from "node:fs/promises";
import loadSources from "./load-sources.mjs";
import log from "../log.mjs";
import Path from "path";
import slugify from "./slugify.mjs";

/**
 * Load a pack from a directory and serialize the DB entries, each to their own file.
 * @param {object} packageData - Information on the package being unpacked.
 * @param {object} compendiumData - Information on the compendium being unpacked.
 * @param {object} argv - The command line arguments.
 * @returns {Promise<void>}
 */
export async function unpackClassicLevel(packageData, compendiumData, argv) {
	const filename = Path.join(packageData.directory, compendiumData.path.replace(/.db$/i, ""));
	if ( isFileLocked(Path.join(filename, "/LOCK")) ) {
		log(Chalk.red(
			`The pack "${Chalk.blue(packDir)}" is currently in use by Foundry VTT. Please close Foundry VTT and try again.`
		));
		return;
	}
	const db = new ClassicLevel(filename, { keyEncoded: "utf8", valueEncoding: "json" });

	const outputDir = Path.join(packageData.directory, `packs/_source/${compendiumData.name}`);
	if ( !existsSync(outputDir) ) mkdirSync(outputDir, { recursive: true });
	const existingFiles = new Set(Object.keys(await loadSources(outputDir)));

	log(`Unpacking "${Chalk.magenta(compendiumData.label)}" from ${Chalk.blue(filename)} into ${Chalk.blue(outputDir)}`);

	const documents = {};
	for await ( const [key, value] of db.iterator() ) {
		let [types, ids] = key.slice(1).split("!");
		types = types.split(".").slice(1);
		ids = ids.split(".");
		let collection = documents;
		let doc;
		while ( ids.length ) {
			doc = collection[ids.shift()] ??= {};
			if ( types.length ) collection = doc[types.shift()] ??= {};
		}
		doc.document = value;
		doc.document._key = key;
	}

	const rebuildDocument = (document, embedded) => {
		document._collections = Object.keys(embedded);
		for ( const [collectionKey, entries] of Object.entries(embedded ?? {}) ) {
			document[collectionKey] = document[collectionKey].reduce((arr, id) => {
				const data = entries[id];
				if ( data ) {
					const { document: d, ...e } = data;
					rebuildDocument(d, e);
					arr.push(d);
				} else log(Chalk.red(
					`The document ${Chalk.blue(documentId)} was not found within the collection of "${Chalk.magenta(document.name)}".`
				));
				return arr;
			}, []);
		}
	};

	for ( const { document, ...embedded } of Object.values(documents) ) {
		rebuildDocument(document, embedded);
		cleanPackEntry(document);
		const documentName = document.name ? `${slugify(document.name, {strict: true})}-${document._id}` : key;
		const documentFilename = `${documentName}.json`;
		const subfolder = getSubfolderName(document, compendiumData);
		const documentPath = Path.join(outputDir, subfolder, documentFilename);
		existingFiles.delete(documentPath);

		if ( !existsSync(Path.join(outputDir, subfolder)) ) mkdirSync(Path.join(outputDir, subfolder), { recursive: true });
		writeFile(documentPath, `${JSON.stringify(document, null, 2)}\n`, { mode: 0o664 });
		if ( existsSync(documentPath) ) log(`${Chalk.blue("Updated")} ${Path.join(subfolder, documentFilename)}`);
		else log(`${Chalk.green("Created")} ${Path.join(subfolder, documentFilename)}`);
	}

	for ( const filename of existingFiles ) {
		rm(filename);
		log(`${Chalk.red("Removed")} ${filename}`);
	}

	await db.close();
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Pack multiple source files into a Classic Level database.
 * @param {object} packageData - Information on the package being packed.
 * @param {object} compendiumData - Information on the compendium being packed.
 * @param {object} argv - The command line arguments.
 * @returns {Promise<void>}
 */
export async function packClassicLevel(packageData, compendiumData, argv) {
	const filename = Path.join(packageData.directory, compendiumData.path.replace(/.db$/i, ""));
	if ( isFileLocked(Path.join(filename, "/LOCK")) ) {
		log(Chalk.red(
			`The pack "${Chalk.blue(packDir)}" is currently in use by Foundry VTT. Please close Foundry VTT and try again.`
		));
		return;
	}
	const db = new ClassicLevel(filename, { keyEncoded: "utf8", valueEncoding: "json" });
	const batch = db.batch();

	const sourceDir = Path.join(packageData.directory, `packs/_source/${compendiumData.name}`);
	let inputFiles = await loadSources(sourceDir);

	log(`Packing "${Chalk.magenta(compendiumData.label)}" from ${Chalk.blue(sourceDir)} into ${Chalk.blue(filename)}`);

	const flattenFile = document => {
		// TODO: Synthesize collections for documents without them
		// TODO: Synthesize keys for documents without them
		for ( const collectionKey of document._collections ?? [] ) {
			document[collectionKey] = document[collectionKey].reduce((arr, doc) => {
				inputFiles[doc._key] = doc;
				flattenFile(doc);
				arr.push(doc._id);
				return arr;
			}, []);
		}
		delete document._collections;
	};
	Object.values(inputFiles).forEach(f => flattenFile(f));

	const seenKeys = new Set();
	for ( const file of Object.values(inputFiles) ) {
		const key = file._key;
		if ( !key ) {
			log(Chalk.red(`Key not available in source file for "${Chalk.blue(compendiumData.label)}", extract from Classic Levels database first to generate key.`));
			return;
		}
		delete file._key;
		seenKeys.add(key);

		const name = file.name ?? file.label;
		try {
			await db.get(key);
			log(`${Chalk.blue("Updated")} ${file._id}${name ? ` - ${name}` : ""}`);
		} catch(err) {
			log(`${Chalk.green("Inserted")} ${file._id}${name ? ` - ${name}` : ""}`);
		} finally {
			batch.put(key, file);
		}
	}

	for ( const key of await db.keys().all() ) {
		if ( seenKeys.has(key) ) continue;
		const document = await db.get(key);
		batch.del(key);
		log(`${Chalk.red("Removed")} ${document._id}${document.name ? ` - ${document.name}` : ""}`);
	}

	await batch.write();
	await db.close();
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Determines whether a file is locked by another process
 * @param {string} filepath
 * @returns {boolean}
 */
function isFileLocked(filepath) {
	try {
		const fd = openSync(filepath, "w");
		closeSync(fd);
		return false;
	} catch(err) {
		if (err.code === "EBUSY") return true;
		else if (err.code === "ENOENT") return false;
		else throw err;
	}
}
