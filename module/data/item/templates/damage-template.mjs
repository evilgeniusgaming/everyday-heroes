/**
 * Data model template for items that cause damage.
 *
 * @property {object} damage
 * @mixin
 */
export default class DamageTemplate extends foundry.abstract.DataModel {
	static defineSchema() {
		return {
			damage: new foundry.data.fields.SchemaField({
				number: new foundry.data.fields.NumberField({
					initial: null, min: 0, integer: true, label: "EH.Equipment.Traits.Damage.Count.Label"
				}),
				denomination: new foundry.data.fields.NumberField({
					initial: null, min: 1, integer: true, label: "EH.Equipment.Traits.Damage.Denomination.Label"
				}),
				type: new foundry.data.fields.StringField({label: "EH.Equipment.Traits.Damage.Type.Label"})
			}, {label: "EH.Equipment.Traits.Damage.Label", hint: "EH.Equipment.Traits.Damage.Hint"})
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Getters                                  */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Has a damage type been specified for this item?
	 * @type {boolean}
	 */
	get hasDamage() {
		return this.damage.type !== "";
	}
}

// Data: required, nullable, initial, validate, label, hint, validationError
// String: blank, trim, choices
// Number: min, max, step, integer, positive, choices
