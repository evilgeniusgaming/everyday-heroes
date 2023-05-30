import fs from "fs";

/**
 * Cache of module packs configurations to avoid repeatedly loading them from disk.
 * @type {object}
 */
let CONFIG_CACHE;

/**
 * Determine a subfolder name based on which pack is being extracted.
 * @param {object} data - Data for the entry being extracted.
 * @param {string} pack - Name of the pack.
 * @returns {string}
 */
export default async function getSubfolderName(data, pack) {
	const configPath = "./system.json";
	if ( !CONFIG_CACHE ) {
		try {
			const json = JSON.parse(fs.readFileSync(configPath));
			CONFIG_CACHE = [];
			json.packs.forEach(p => {
				const filename = p.path.replace("./packs/", "").replace(".db", "");
				CONFIG_CACHE[filename] = p;
			});
		} catch(error) { return ""; }
	}

	const config = CONFIG_CACHE[pack];
	let name = "";
	switch (config?.flags?.["everyday-heroes"]?.sorting) {
		case "auto":
			name = sortAuto(data, config);
			break;
		case "manual":
			name = sortManual(data, config);
			break;
		case "flat":
		default:
			return "";
	}
	return name.replace(/[A-Z]+(?![a-z])|[A-Z]/g, (a, b) => (b ? "-" : "") + a.toLowerCase());
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Determine subfolders automatically using item type information.
 * @param {object} data - Data for the entry being processed.
 * @param {object} config - Configuration data for the compendium pack being processed.
 * @returns {string}
 */
function sortAuto(data, config) {
	const category = data.system.type?.category;
	const type = data.system.type?.value;
	switch (data.type) {
		case "feat":
			if ( !category ) break;
			if ( category === "advanced" ) {
				return `advanced-${type}-feats`;
			} else return `${category}-feats`;
		case "talent":
			if ( !type ) break;
			return `${type}-talents`;
		case "specialFeature":
			if ( !type ) break;
			return `${type}-special-features`;
		case "weapon":
			if ( !category ) break;
			return `weapon/${category}`;
		case "gear":
			if ( !type ) break;
			return `gear/${type}`;
	}
	return data.type;
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Determine subfolders manually using flags.
 * @param {object} data - Data for the entry being processed.
 * @param {object} config - Configuration data for the compendium pack being processed.
 * @returns {string}
 */
function sortManual(data, config) {
	return "";
}
