import { createFormOptions } from "../../utils.mjs";
import BaseItemSheetV2 from "./base-item-sheet-v2.mjs";

/**
 * Sheet that represents Talent, Special Feature, Plan, Trick, and Feat items.
 */
export default class FeatureSheetV2 extends BaseItemSheetV2 {

	/** @override */
	static DEFAULT_OPTIONS = {
		classes: ["feature"]
	};

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Rendering                                */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @inheritDoc */
	async _prepareDetailsContext(context, options) {
		context = await super._prepareDetailsContext(context, options);

		const type = context.item.system.metadata?.type ?? context.item.type;
		const itemCategories = foundry.utils.getProperty(CONFIG.EverydayHeroes, `${type}Categories`);
		context.fields = [
			!foundry.utils.isEmpty(itemCategories) ? this._createFormField(context, "type.category", {
				options: createFormOptions(itemCategories, { blank: true })
			}) : null,
			context.system.types ? this._createFormField(context, "type.value", {
				options: createFormOptions(context.system.types, { blank: true })
			}) : null,
			this._createFormField(context, "activation.type", {
				hint: false,
				options: createFormOptions(CONFIG.EverydayHeroes.actionTypesStandard, { blank: _loc("COMMON.None") })
			}),
			this._createFormField(context, "activation.condition", {
				hint: false
			}),
			context.system.hasActionPoints ? this._createFormField(context, "activation.amount", {
				placeholder: 1
			}) : null,
			...this.item.system.createConsumptionFormFields(context)
		];

		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @inheritDoc */
	async _prepareHeaderContext(context, options) {
		context = await super._prepareHeaderContext(context, options);

		const type = context.item.system.metadata?.type ?? context.item.type;
		const itemTypes = foundry.utils.getProperty(CONFIG.EverydayHeroes, `${type}Types`) ?? {};
		const itemType = itemTypes[context.system.type?.value];
		if ( ((type !== "talent") && ("level" in (context.system.type ?? {}))) || itemType?.leveled ) {
			context.headerFields.push(this._createFormField(context, "type.level", { hint: false }));
		}

		return context;
	}
}
