import ActiveEffectEH from "../../documents/active-effect.mjs";

/**
 * Sheet that represents Talent, Special Feature, Plan, Trick, and Feat items.
 */
export default class FeatureSheet extends ItemSheet {

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["everyday-heroes", "sheet", "feature", "item"],
			template: "systems/everyday-heroes/templates/item/feature-sheet.hbs",
			tabs: [{navSelector: 'nav[data-group="primary"]', contentSelector: "main", initial: "description"}],
			width: 570,
			height: 500
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Context Preparation                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async getData(options) {
		const context = await super.getData(options);

		context.CONFIG = CONFIG.EverydayHeroes;
		context.system = context.item.system;
		context.source = context.item.system.toObject();

		context.effects = ActiveEffectEH.prepareActiveEffectSections(context.item.effects);

		context.resources = Object.entries(context.item.actor?.system.resources ?? {}).reduce((obj, [key, resource]) => {
			if ( !resource.disabled ) obj[key] = resource.label;
			return obj;
		}, {});

		const enrichmentContext = {
			secrets: this.item.isOwner, rollData: this.item.getRollData(), async: true, relativeTo: this.item
		};
		context.enriched = {
			description: await TextEditor.enrichHTML(context.system.description.value, enrichmentContext),
			chat: await TextEditor.enrichHTML(context.system.description.chat, enrichmentContext)
		};

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
