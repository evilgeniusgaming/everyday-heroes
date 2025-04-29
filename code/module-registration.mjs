import TableOfContentsCompendium from "./applications/compendium/table-of-contents.mjs";
import { systemLog } from "./utils.mjs";

/**
 * Scan module manifests for any data that should be integrated into the system configuration.
 */
export function registerModuleData() {
	systemLog("Registering Module Data", { level: "groupCollapsed" });
	for ( const manifest of [game.system, ...game.modules.filter(m => m.active), game.world] ) {
		try {
			const complete = methods.map(m => m(manifest)).filter(r => r);
			if ( complete.length ) systemLog(`Registered ${manifest.title} data: ${complete.join(", ")}`);
		} catch(err) {
			systemLog(`Error registering ${manifest.title}\n`, { extras: [err.message], level: "error" });
		}
	}
	console.groupEnd();
}

const methods = [];

/* <><><><> <><><><> <><><><> <><><><> <><><><> <><><><> */
/*                    Compendium Packs                   */
/* <><><><> <><><><> <><><><> <><><><> <><><><> <><><><> */

/**
 * Apply any changes to compendium packs during the setup hook.
 */
export function setupModulePacks() {
	systemLog("Setting Up Compendium Packs", { level: "groupCollapsed" });
	for ( const pack of game.packs ) {
		try {
			const complete = setupMethods.map(m => m(pack)).filter(r => r);
			if ( complete.length ) systemLog(`Finished setting up ${pack.metadata.label}: ${complete.join(", ")}`);
		} catch(err) {
			systemLog(`Error setting up ${pack.title}\n`, { extras: [err.message], level: "error" });
		}
	}
	if ( sortingChanged ) game.settings.set("core", "collectionSortingModes", collectionSortingModes);
	console.groupEnd();
}

const setupMethods = [setupPackDisplay, setupPackSorting];

/* -------------------------------------------- */

/**
 * Set application based on `flags.everyday-heroes.sorting`.
 * @param {Compendium} pack - Pack to set up.
 * @returns {string|void} - Description of the step.
 */
function setupPackDisplay(pack) {
	const display = pack.metadata.flags.sorting ?? pack.metadata.flags[game.system.id]?.sorting;
	if ( display !== "table-of-contents" ) return;
	pack.applicationClass = TableOfContentsCompendium;
	return "table of contents";
}

/* -------------------------------------------- */

let collectionSortingModes;
let sortingChanged = false;

/**
 * Set default sorting order based on `flags.everyday-heroes.sorting`.
 * @param {Compendium} pack - Pack to set up.
 * @returns {string|void} - Description of the step.
 */
function setupPackSorting(pack) {
	collectionSortingModes ??= game.settings.get("core", "collectionSortingModes") ?? {};
	const flag = pack.metadata.flags[game.system.id]?.sorting;
	if ( !flag || (flag === "table-of-contents") || collectionSortingModes[pack.metadata.id] ) return;
	collectionSortingModes[pack.metadata.id] = pack.metadata.flags[game.system.id].sorting;
	sortingChanged = true;
	return "default sorting";
}
