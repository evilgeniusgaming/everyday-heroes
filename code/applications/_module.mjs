import { systemLog } from "../utils.mjs";
import * as actor from "./actor/_module.mjs";
import * as item from "./item/_module.mjs";
import * as journal from "./journal/_module.mjs";

/**
 * Automatically register Document sheets using category information from config or metadata in SystemDataModels.
 * @param {typeof Document} documentType - Type of document to register (e.g. Actor or Item).
 * @param {Object<CategoryConfiguration>} categories - Categories to register.
 */
export function registerSheets(documentType, categories) {
	systemLog(`Registering ${documentType.name} sheets`, {level: "groupCollapsed"});
	const models = CONFIG[documentType.name].dataModels;
	const registered = new Set();
	for ( const [key, category] of Object.entries(categories) ) {
		if ( !category.sheet ) continue;
		const filtered = category.types.filter(t => !models[t]?.metadata?.sheet);
		filtered.forEach(f => registered.add(f));
		DocumentSheetConfig.registerSheet(documentType, "everyday-heroes", category.sheet.application, {
			types: Array.from(filtered), makeDefault: true, label: category.sheet.label
		});
		systemLog(`Registered ${key} sheet for: ${filtered.join(", ")}`);
	}
	for ( const type of new Set(Object.keys(models)).difference(registered) ) {
		const metadata = models[type]?.metadata?.sheet;
		if ( !metadata ) continue;
		registered.add(type);
		DocumentSheetConfig.registerSheet(documentType, "everyday-heroes", metadata.application, {
			types: [type], makeDefault: true, label: metadata.label
		});
		systemLog(`Registered ${type} sheet`);
	}
	DocumentSheetConfig.unregisterSheet(
		documentType, "core", {name: `${documentType.name}Sheet`}, {types: Array.from(registered)}
	);
	console.groupEnd();
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Insert custom classes into document sheet headers.
 * @param {DocumentSheet} app
 * @param {jQuery} jQuery
 * @param {object} options
 */
export function renderDocumentSheet(app, jQuery, options) {
	const newClass = app.document.getFlag("everyday-heroes", "source");
	if ( !newClass ) return;
	const container = jQuery[0];
	container.classList.add(newClass);
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

export {actor, item, journal};
export * as advancement from "./advancement/_module.mjs";
export {default as CombatTrackerEH} from "./combat-tracker.mjs";
export * as dice from "./dice/_module.mjs";
export * as compendium from "./compendium/_module.mjs";
