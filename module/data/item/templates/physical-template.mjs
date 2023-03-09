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
}
