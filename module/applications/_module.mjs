import * as actor from "./actor/_module.mjs";

/**
 * Register the various sheets provided by Everyday Heroes during initialization.
 */
export function registerSheets() {
	DocumentSheetConfig.registerSheet(Actor, "everyday-heroes", actor.HeroSheetEH, {
		types: ["hero"],
		makeDefault: true,
		label: "EH.Sheets.Hero"
	});
}

export {actor};
