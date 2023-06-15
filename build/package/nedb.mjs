import Chalk from "chalk";
import { cleanPackEntry } from "./clean.mjs";
import getSubfolderName from "./folders.mjs";
import Datastore from "nedb-promises";
import { existsSync, mkdirSync } from "node:fs";
import { rm, writeFile } from "node:fs/promises";
import loadSources from "./load-sources.mjs";
import log from "../log.mjs";
import Path from "path";
import slugify from "./slugify.mjs";

/**
 * Load a pack from a directory and serialize the DB entries, each to their own file
 * @param {object} packageData - Information on the package being unpacked.
 * @param {object} compendiumData - Information on the compendium being unpacked.
 * @param {object} argv - The command line arguments.
 * @returns {Promise<void>}
 */
export async function unpackNedb(packageData, compendiumData, argv) {
	const filename = Path.join(packageData.directory, compendiumData.path);
	const db = new Datastore({ filename, autoload: true });

	const outputDir = Path.join(packageData.directory, `packs/_source/${compendiumData.name}`);
	if ( !existsSync(outputDir) ) mkdirSync(outputDir, { recursive: true });
	const existingFiles = new Set(Object.keys(await loadSources(outputDir)));

	log(`Unpacking "${Chalk.magenta(compendiumData.label)}" from ${Chalk.blue(filename)} into ${Chalk.blue(outputDir)}`);

	const documents = await db.find({});
	for ( const document of documents ) {
		cleanPackEntry(document);
		const documentFilename = `${slugify(document.name, {strict: true})}-${document._id}.json`;
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
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Pack multiple source files into a single NeDB file.
 * @param {object} packageData - Information on the package being packed.
 * @param {object} compendiumData - Information on the compendium being packed.
 * @param {object} argv - The command line arguments.
 * @returns {Promise<void>}
 */
export async function packNedb(packageData, compendiumData, argv) {
	const filename = Path.join(packageData.directory, compendiumData.path);
	const db = Datastore.create(filename);
	const sourceDir = Path.join(packageData.directory, `packs/_source/${compendiumData.name}`);
	const inputFiles = await loadSources(sourceDir);

	log(`Packing "${Chalk.magenta(compendiumData.label)}" from ${Chalk.blue(sourceDir)} into ${Chalk.blue(filename)}`);

	const seenKeys = new Set();
	for ( const file of Object.values(inputFiles) ) {
		seenKeys.add(file._id);

		const existing = await db.findOne({ _id: file._id });
		if ( existing ) {
			await db.update({ _id: file._id }, file);
			log(`${Chalk.blue("Updated")} ${file._id}${file.name ? ` - ${file.name}` : ""}`);
		} else {
			await db.insert(file);
			log(`${Chalk.green("Inserted")} ${file._id}${file.name ? ` - ${file.name}` : ""}`);
		}
	}

	const documents = await db.find({ _id: {$nin: Array.from(seenKeys)} });
	for ( const document of documents ) {
		await db.remove({ _id: document._id }, {});
		log(`${Chalk.red("Removed")} ${document._id}${document.name ? ` - ${document.name}` : ""}`);
	}

	db.stopAutocompaction();
	await new Promise(resolve => {
		db.compactDatafile(resolve);
	});
}
