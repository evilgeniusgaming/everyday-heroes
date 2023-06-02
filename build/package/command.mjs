import Chalk from "chalk";
import { readdir, readFile } from "node:fs/promises";
import path from "path";
import { packClassicLevel, unpackClassicLevel } from "./classic-level.mjs";
import log from "../log.mjs";
import { packNedb, unpackNedb } from "./nedb.mjs";

/**
 * Get the command object for the package command.
 * @returns {{handler: ((function(*): Promise<void>)|*), builder: builder, describe: string, command: string}}
 */
export default function getCommand() {
	return {
		command: "package [action] [value]",
		describe: "Manage packages",
		builder: yargs => {
			yargs.positional("action", {
				describe: "The action to perform",
				type: "string",
				choices: ["unpack", "pack"]
			});

			yargs.positional("value", {
				describe: "Name of the pack upon which to work.",
				type: "string"
			});

			yargs.option("id", {
				descibe: "ID of the package within which to work.",
				type: "string"
			});

			yargs.option("pack", {
				alias: "n",
				descibe: "Name of compendium pack to operate upon.",
				type: "string"
			});

			yargs.option("nedb", {
				describe: "Whether to use NeDB instead of ClassicLevel when packing & unpacking.",
				type: "boolean"
			});
		},
		handler: async argv => {
			switch ( argv.action ) {
				case "unpack":
					await _handleUnpack(argv);
					break;
				case "pack":
					await _handlePack(argv);
					break;
			}
		}
	};

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Scan the folder for package registrations.
	 * @param {string} prefix - Folder prefix to search subfolders.
	 * @returns {Object<string, object>} - Mapping of module IDs and manifest contents.
	 */
	async function _detectPackages(prefix) {
		const manifestNames = ["system", "module", "world"];

		const paths = [];
		if ( prefix ) {
			// TODO: Find all packages with prefix
		} else {
			paths.push("./");
		}

		const packages = {};
		for ( const directory of paths ) {
			let manifest;
			let type;
			for ( const manifestType of manifestNames ) {
				try {
					const manifestPath = path.join(directory, `${manifestType}.json`);
					manifest = JSON.parse(await readFile(manifestPath, { encoding: "utf8" }));
					type = manifestType;
				} catch(err) {
					continue;
				}
				break;
			}
			if ( manifest ) packages[manifest.id] = { type, directory, manifest };
		}

		return packages;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Load a pack from a directory and serialize the DB entries, each to their own file
	 * @param {object} argv - The command line arguments.
	 * @returns {Promise<void>}
	 * @private
	 */
	async function _handleUnpack(argv) {
		const dbMode = argv.nedb ? "nedb" : "classic-level";
		const compendiumName = argv.pack ?? argv.value;
		const packages = await _detectPackages();

		// Loop through each package
		for ( const packageData of Object.values(packages) ) {
			// Loop through each pack in a package matching the pack filter, if provided
			for ( const compendiumData of packageData.manifest.packs ?? [] ) {
				if ( compendiumName && (compendiumData.name !== compendiumName) ) continue;
				try {
					if ( dbMode === "nedb" ) await unpackNedb(packageData, compendiumData, argv);
					else if ( dbMode === "classic-level" ) await unpackClassicLevel(packageData, compendiumData, argv);
					else throw new Error(`${Chalk.red("Error:")} Operating on both database types not possible during unpacking.`);
				} catch(err) {
					log(err.message);
				}
			}
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Load separate source files and pack into a single database.
	 * @param {object} argv - The command line arguments.
	 * @returns {Promise<void>}
	 * @private
	 */
	async function _handlePack(argv) {
		const dbMode = argv.nedb ? "nedb" : "classic-level";
		const compendiumName = argv.pack ?? argv.value;
		const packages = await _detectPackages();

		// Loop through each package
		for ( const packageData of Object.values(packages) ) {
			// Loop through each pack in a package matching the pack filter, if provided
			for ( const compendiumData of packageData.manifest.packs ?? [] ) {
				if ( compendiumName && (compendiumData.name !== compendiumName) ) continue;
				try {
					if ( dbMode === "nedb" ) await packNedb(packageData, compendiumData, argv);
					else if ( dbMode === "classic-level" ) await packClassicLevel(packageData, compendiumData, argv);
					else throw new Error(`${Chalk.red("Error:")} Packing both database formats not yet supported.`);
				} catch(err) {
					log(err.message);
				}
			}
		}
	}
}
