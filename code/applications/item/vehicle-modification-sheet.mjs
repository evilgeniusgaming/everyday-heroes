import { numberFormat } from "../../utils.mjs";
import BasePhysicalSheet from "./base-physical-sheet.mjs";

/**
 * Sheet that represents Vehicle Modification items.
 */
export default class VehicleModificationSheet extends BasePhysicalSheet {

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["everyday-heroes", "sheet", "vehicle-modification", "item"],
			template: "systems/everyday-heroes/templates/item/vehicle-modification-sheet.hbs"
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Context Preparation                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async getData(options) {
		const context = await super.getData(options);

		context.abilities = Object.entries(context.system.abilities).reduce((obj, [id, mod]) => {
			const abilityConfig = CONFIG.EverydayHeroes.abilities[id];
			obj[id] = {
				label: abilityConfig.label,
				abbreviation: abilityConfig.abbreviation,
				mod: mod ? numberFormat(mod, { sign: "always" }) : ""
			};
			return obj;
		}, {});

		return context;
	}
}
