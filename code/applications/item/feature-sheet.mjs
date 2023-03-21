import ActiveEffectEH from "../../documents/active-effect.mjs";
import BaseItemSheet from "./base-item-sheet.mjs";

/**
 * Sheet that represents Talent, Special Feature, Plan, Trick, and Feat items.
 */
export default class FeatureSheet extends BaseItemSheet {

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["everyday-heroes", "sheet", "feature", "item"],
			template: "systems/everyday-heroes/templates/item/feature-sheet.hbs"
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Context Preparation                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async getData(options) {
		const context = await super.getData(options);

		context.effects = ActiveEffectEH.prepareActiveEffectSections(context.item.effects);

		context.itemSubTypes = foundry.utils.getProperty(CONFIG.EverydayHeroes, `${context.item.type}Types`);

		context.resources = Object.entries(context.item.actor?.system.resources ?? {}).reduce((obj, [key, resource]) => {
			if ( !resource.disabled ) obj[key] = resource.label;
			return obj;
		}, {});

		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Action Handlers                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	activateListeners(jQuery) {
		super.activateListeners(jQuery);
		const html = jQuery[0];

		// Effect Listeners
		for ( const element of html.querySelectorAll('[data-action="effect"]') ) {
			element.addEventListener("click", ActiveEffectEH.onEffectAction.bind(this));
		}
	}
}
