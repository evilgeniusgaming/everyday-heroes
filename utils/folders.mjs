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
	switch (config?.flags?.type) {
		case "concept":
			name = sortConcept(data, config);
			break;
		case "physical":
			name = sortPhysical(data, config);
			break;
		case "flat":
		default:
			return "";
	}
	return name.replace(/[A-Z]+(?![a-z])|[A-Z]/g, (a, b) => (b ? "-" : "") + a.toLowerCase());
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Determine subfolders for concept Items.
 * @param {object} data - Data for the entry being processed.
 * @param {object} config - Configuration data for the compendium pack being processed.
 * @returns {string}
 */
function sortConcept(data, config) {
	switch (data.type) {
		case "feat":
			if ( !data.system.type.category ) break;
			if ( data.system.type.category === "advanced" ) {
				return `advanced-${data.system.type.value}-feats`;
			} else return `${data.system.type.category}-feats`;
		case "talent":
			if ( !data.system.type.value ) break;
			return `${data.system.type.value}-talents`;
		case "specialFeature":
			if ( !data.system.type.value ) break;
			return `${data.system.type.value}-special-features`;
	}
	return data.type;
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Determine subfolders for physical Items.
 * @param {object} data - Data for the entry being processed.
 * @param {object} config - Configuration data for the compendium pack being processed.
 * @returns {string}
 */
function sortPhysical(data, config) {
	return data.type;
}
