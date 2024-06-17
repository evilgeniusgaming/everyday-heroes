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

		const type = context.item.system.metadata?.type ?? context.item.type;
		context.itemCategories = foundry.utils.getProperty(CONFIG.EverydayHeroes, `${type}Categories`);
		context.itemTypes = foundry.utils.getProperty(CONFIG.EverydayHeroes, `${type}Types`);
		const itemtype = context.itemTypes?.[context.system.type?.value];
		context.showLevel = ((type !== "talent") && ("level" in (context.system.type ?? {}))) || itemtype?.leveled;

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
