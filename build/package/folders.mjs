/**
 * Determine a subfolder name based on which pack is being extracted.
 * @param {object} document - Data for the entry being extracted.
 * @param {object} compendiumData - Information on the pack.
 * @returns {string}
 */
export default function getSubfolderName(document, compendiumData) {
	let name = "";
	switch (compendiumData.flags?.["everyday-heroes"]?.sorting) {
		case "auto":
			name = sortAuto(document, compendiumData);
			break;
		case "manual":
			name = sortManual(document, compendiumData);
			break;
	}
	return name.replace(/[A-Z]+(?![a-z])|[A-Z]/g, (a, b) => (b ? "-" : "") + a.toLowerCase());
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Determine subfolders automatically using item type information.
 * @param {object} document - Data for the entry being processed.
 * @param {object} config - Configuration data for the compendium pack being processed.
 * @returns {string}
 */
function sortAuto(document, config) {
	const category = document.system.type?.category;
	const type = document.system.type?.value;
	switch (document.type) {
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
	return document.type;
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Determine subfolders manually using flags.
 * @param {object} document - Data for the entry being processed.
 * @param {object} config - Configuration data for the compendium pack being processed.
 * @returns {string}
 */
function sortManual(document, config) {
	return "";
}
