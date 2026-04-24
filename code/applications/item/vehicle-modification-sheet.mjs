import { numberFormat } from "../../utils.mjs";
import BaseItemSheetV2 from "./base-item-sheet-v2.mjs";

/**
 * Sheet that represents Vehicle Modification items.
 */
export default class VehicleModificationSheet extends BaseItemSheetV2 {

	/** @override */
	static DEFAULT_OPTIONS = {
		classes: ["vehicle-modification"]
	};

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Rendering                                */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @inheritDoc */
	async _prepareDetailsContext(context, options) {
		context = await super._prepareDetailsContext(context, options);

		context.fields = [
			{ header: { text: "EH.Vehicle.Modifications.Label" } },
			{
				fields: Object.entries(context.system.abilities).map(([id, value]) =>
					this._createFormField(context, `abilities.${id}`, {
						classes: "label-top",
						label: CONFIG.EverydayHeroes.abilities[id]?.label ?? "",
						name: `system.abilities.${id}`
					})
				),
				group: {
					label: "EH.Ability.Label[other]"
				}
			},
			this._createFormField(context, "armorValue"),
			{ header: { text: "EH.Equipment.Property.Label[other]" } },
			{ template: "everydayHeroes.item-properties" }
		]

		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @inheritDoc */
	async _prepareHeaderContext(context, options) {
		context = await super._prepareHeaderContext(context, options);
		context.headerFields.push(this._createFormField(context, "price", { classes: "label-top", hint: false }));
		return context;
	}
}
