import { numberFormat } from "../../../utils.mjs";

/**
 * Data model template for physical items.
 *
 * @property {number} bulk - How heavy/unwieldy is this item?
 * @property {number} price - How much wealth is required to purchase this item?
 * @mixin
 */
export default class PhysicalTemplate extends foundry.abstract.DataModel {
	static defineSchema() {
		return {
			bulk: new foundry.data.fields.NumberField({
				required: true, nullable: false, initial: 0, min: 0, integer: true,
				label: "EH.Equipment.Trait.Bulk.Label", hint: "EH.Equipment.Trait.Bulk.Hint"
			}),
			price: new foundry.data.fields.NumberField({
				required: true, nullable: false, initial: 0, min: 0, integer: true,
				label: "EH.Equipment.Trait.PriceLevel.Label", hint: "EH.Equipment.Trait.PriceLevel.Hint"
			})
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare tags for physical details of this item.
	 * @type {ChatTag[]}
	 */
	get physicalTags() {
		const tags = [];
		if ( this.price ) tags.push({
			label: `${game.i18n.localize("EH.Equipment.Trait.PriceLevel.Label")} ${numberFormat(this.price)}`,
			class: "property"
		});
		if ( this.bulk ) tags.push({
			label: `${game.i18n.localize("EH.Equipment.Trait.Bulk.Label")} ${numberFormat(this.bulk)}`,
			class: "property"
		});
		return tags;
	}
}
