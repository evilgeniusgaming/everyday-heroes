import * as actor from "./actor/_module.mjs";
import * as item from "./item/_module.mjs";

/**
 * Register the various sheets provided by Everyday Heroes during initialization.
 */
export function registerSheets() {
	DocumentSheetConfig.registerSheet(Actor, "everyday-heroes", actor.HeroSheet, {
		types: ["hero"],
		makeDefault: true,
		label: "EH.Sheets.Hero"
	});
	DocumentSheetConfig.registerSheet(Item, "everyday-heroes", item.ConceptSheet, {
		types: ["archetype", "class", "background", "profession"],
		makeDefault: true,
		label: "EH.Sheets.Concept"
	});
	DocumentSheetConfig.registerSheet(Item, "everyday-heroes", item.PhysicalSheet, {
		types: ["armor", "weapon", "explosive", "gear"],
		makeDefault: true,
		label: "EH.Sheets.Physical"
	});
}

export {actor, item};
export * as advancement from "./advancement/_module.mjs";
