import ActiveEffectEH from "../../documents/active-effect.mjs";
import AdvancementItemSheet from "./advancement-item-sheet.mjs";

/**
 * Sheet that represents Talent, Special Feature, Plan, Trick, and Feat items.
 */
export default class FeatureSheet extends AdvancementItemSheet {

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

		context.itemCategories = foundry.utils.getProperty(CONFIG.EverydayHeroes, `${context.item.type}Categories`);
		context.itemSubTypes = (context.item.type !== "feat" || context.system.type.category === "advanced")
			? foundry.utils.getProperty(CONFIG.EverydayHeroes, `${context.item.type}Types`) : null;

		context.resources = Object.entries(context.item.actor?.system.resources ?? {}).reduce((obj, [key, resource]) => {
			if ( !resource.disabled ) obj[key] = resource.label;
			return obj;
		}, {});

		context.registeredFields = [];
		for ( const field of context.item.system.constructor.registeredFields ?? [] ) {
			field.options = await CONFIG.EverydayHeroes.registration.filter(field.type, field.filterCallback);
			field.selected = foundry.utils.getProperty(context.item, field.keyPath);
			context.registeredFields.push(field);
		}

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
