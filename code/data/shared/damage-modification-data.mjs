/**
 * Data model for modification to another damage.
 *
 * @property {number} number - Change to the damage dice count.
 * @property {number} denomination - Change to the damage denomination.
 * @property {string} type - Change to the type of damage.
 */
export default class DamageModificationData extends foundry.abstract.DataModel {
	static defineSchema() {
		return {
			number: new foundry.data.fields.NumberField({
				initial: 0, integer: true, label: "EH.Equipment.Trait.Damage.Count.Label",
				hint: "EH.Equipment.Trait.DamageModification.Count.Hint"
			}),
			denomination: new foundry.data.fields.NumberField({
				initial: 0, integer: true, label: "EH.Equipment.Trait.Damage.Denomination.Label",
				hint: "EH.Equipment.Trait.DamageModification.Denomination.Hint"
			}),
			type: new foundry.data.fields.StringField({
				label: "EH.Equipment.Trait.Damage.Type.Label", hint: "EH.Equipment.Trait.DamageModification.Type.Hint",
				suggestions: CONFIG.EverydayHeroes.damageTypes
			})
		};
	}
}
