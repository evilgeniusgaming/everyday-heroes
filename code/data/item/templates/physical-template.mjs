import { numberFormat } from "../../../utils.mjs";

/**
 * Data model template for physical items.
 *
 * @property {object} quantity
 * @property {number} quantity.value - How many of this item are there?
 * @property {number} bulk - How heavy/unwieldy is this item?
 * @property {number} price - How much wealth is required to purchase this item?
 * @mixin
 */
export default class PhysicalTemplate extends foundry.abstract.DataModel {
	static defineSchema() {
		return {
			quantity: new foundry.data.fields.SchemaField({
				value: new foundry.data.fields.NumberField({
					required: true, nullable: false, initial: 1, min: 0, integer: true, label: "EH.Equipment.Trait.Quantity.Label"
				})
			}),
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
	 * Should the details tab be displayed on the sheet for this item type?
	 * @type {boolean}
	 */
	get hasDetails() {
		return true;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Can this item be equipped on player sheets?
	 * @type {boolean}
	 */
	get isEquippable() {
		return false;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare tags for physical details of this item.
	 * @type {ChatTag[]}
	 */
	get physicalTags() {
		const tags = [];
		if ( this.price ) tags.push({
			label: `${game.i18n.localize("EH.Equipment.Trait.PriceLevel.Label")} ${numberFormat(this.price)}`,
			class: "type"
		});
		if ( this.bulk ) tags.push({
			label: `${game.i18n.localize("EH.Equipment.Trait.Bulk.Label")} ${numberFormat(this.bulk)}`,
			class: "type"
		});
		return tags;
	}
}
