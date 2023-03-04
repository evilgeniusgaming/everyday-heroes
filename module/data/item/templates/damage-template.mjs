/**
 * Data model template for items that cause damage.
 *
 * @property {object} damage
 * @mixin
 */
export default class DamageTemplate extends foundry.abstract.DataModel {

	/**
	 * Damage mode to use when constructing the schema, either "regular" or "modification".
	 * @type {string}
	 */
	static damageMode = "regular";

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		return {
			damage: new foundry.data.fields.SchemaField({
				number: new foundry.data.fields.NumberField({
					initial: null, min: this.damageMode === "regular" ? 0 : undefined, integer: true,
					label: "EH.Equipment.Traits.Damage.Count.Label"
				}),
				denomination: new foundry.data.fields.NumberField({
					initial: null, min: this.damageMode === "regular" ? 1 : undefined, integer: true,
					label: "EH.Equipment.Traits.Damage.Denomination.Label"
				}),
				type: new foundry.data.fields.StringField({label: "EH.Equipment.Traits.Damage.Type.Label"})
			}, {label: "EH.Equipment.Traits.Damage.Label", hint: "EH.Equipment.Traits.Damage.Hint"})
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Getters                                  */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Is the damage defined on this item "regular" damage or a "modification" to another damage?
	 * @type {string}
	 */
	get damageMode() {
		return this.constructor.damageMode;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Has a damage type been specified for this item?
	 * @type {boolean}
	 */
	get hasDamage() {
		return this.damage.type !== "";
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Helper Methods                           */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Modify the damage provided by this item with another. If the other item has a "regular" damage type
	 * then it will replace this item's damage. If it has a "modification" damage type then it will be used
	 * to alter this item's damage.
	 * @param {ItemEH} other - Other item with which to modify the damage.
	 * @returns {object}
	 */
	modifyDamage(other) {
		const damage = this.toObject().damage;
		if ( other.system.constructor.damageMode === "regular" ) {
			return foundry.utils.mergeObject(damage, other.system.toObject().damage);
		}
		damage.number = (damage.number ?? 1) + (other.system.damage.number ?? 0);
		damage.denomination = EverydayHeroes.dice.utils.stepDenomination(
			damage.denomination, other.system.damage.denomination
		);
		if ( other.system.damage.type ) damage.type = other.system.damage.type;
		return damage;
	}
}
