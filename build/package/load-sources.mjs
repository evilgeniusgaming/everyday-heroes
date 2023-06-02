import { readdir, readFile } from "node:fs/promises";
import Path from "path";

/**
 * Load all of the JSON files within the target directory and all sub-directories.
 * @param {string} path - Directory to search.
 * @returns {Object<string, data>} - Mapping of filenames to JSON contents.
 */
export default async function loadSources(path) {
	const files = {};
	await _loadSources(path, files);
	return files;
}

/**
 * Internal recursive function for searching sub-folders.
 * @param {string} path - Directory to search.
 * @param {Object<string, data>} files - Mapping of filenames to JSON contents.
 * @private
 */
async function _loadSources(path, files) {
	try {
		const directory = await readdir(path, { withFileTypes: true });
		for ( const entry of directory ) {
			const entryPath = Path.join(path, entry.name);
			if ( entry.isDirectory() ) await _loadSources(entryPath, files);
			else if ( entryPath.endsWith(".json") ) {
				const file = await readFile(entryPath, { encoding: "utf8" });
				files[entryPath] = JSON.parse(file);
			}
		}
	} catch(err) {
		console.error(err);
	}
}
