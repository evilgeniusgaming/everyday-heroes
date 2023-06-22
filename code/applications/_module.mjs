import * as actor from "./actor/_module.mjs";
import * as item from "./item/_module.mjs";
import * as journal from "./journal/_module.mjs";

/**
 * Register the various sheets provided by Everyday Heroes during initialization.
 */
export function registerSheets() {
	DocumentSheetConfig.unregisterSheet(Actor, "core", ActorSheet);
	DocumentSheetConfig.registerSheet(Actor, "everyday-heroes", actor.HeroSheet, {
		types: ["hero"],
		makeDefault: true,
		label: "EH.Sheet.Hero"
	});
	DocumentSheetConfig.registerSheet(Actor, "everyday-heroes", actor.NPCSheet, {
		types: ["npc"],
		makeDefault: true,
		label: "EH.Sheet.NPC"
	});
	DocumentSheetConfig.unregisterSheet(Item, "core", ItemSheet);
	DocumentSheetConfig.registerSheet(Item, "everyday-heroes", item.ConceptSheet, {
		types: CONFIG.EverydayHeroes.itemCategories.concept.types,
		makeDefault: true,
		label: "EH.Sheet.Concept"
	});
	DocumentSheetConfig.registerSheet(Item, "everyday-heroes", item.FeatureSheet, {
		types: CONFIG.EverydayHeroes.itemCategories.feature.types,
		makeDefault: true,
		label: "EH.Sheet.Feature"
	});
	DocumentSheetConfig.registerSheet(Item, "everyday-heroes", item.PhysicalSheet, {
		types: CONFIG.EverydayHeroes.itemCategories.physical.types,
		makeDefault: true,
		label: "EH.Sheet.Physical"
	});
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
export * as compendium from "./compendium/_module.mjs";
