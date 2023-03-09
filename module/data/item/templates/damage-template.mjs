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
					label: "EH.Equipment.Trait.Damage.Count.Label"
				}),
				denomination: new foundry.data.fields.NumberField({
					initial: null, min: this.damageMode === "regular" ? 1 : undefined, integer: true,
					label: "EH.Equipment.Trait.Damage.Denomination.Label"
				}),
				type: new foundry.data.fields.StringField({label: "EH.Equipment.Trait.Damage.Type.Label"})
			}, {label: "EH.Equipment.Trait.Damage.Label", hint: "EH.Equipment.Trait.Damage.Hint"})
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
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedDamageDice() {
		this.damage.dice = `${this.damage.number ?? 1}d${this.damage.denomination ?? CONFIG.EverydayHeroes.diceSteps[0]}`;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Helper Methods                           */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Key for the ability that adds to damage rolls for this item.
	 * @param {string} type - Attack type (e.g. "melee", "ranged", "burst", "thrown").
	 * @returns {string|null}
	 */
	damageAbility(type) {
		return null;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Construct the damage formula for this item. Returns nothing if damage mode is "modification".
	 * @param {string} type - Attack type (e.g. "melee", "ranged", "burst", "thrown").
	 * @returns {string}
	 */
	damageFormula(type) {
		if ( this.constructor.damageMode !== "regular" ) return "";
		const ability = this.parent?.actor?.system.abilities[this.damageAbility(type)];
		if ( !ability?.mod ) return this.damage.dice;
		return `${this.damage.dice} + ${ability.mod}`;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Modify a "regular" damage object with changes from a "modification" damage object.
	 * @param {object} original - Regular damage object to be modified.
	 * @param {object} other - Modification damage object with which to modify the original.
	 * @returns {object}
	 */
	modifyDamage(original, other) {
		const damage = foundry.utils.deepClone(original);
		damage.number = (damage.number ?? 1) + (other.number ?? 0);
		damage.denomination = EverydayHeroes.dice.utils.stepDenomination(
			damage.denomination, other.denomination
		);
		if ( other.type ) damage.type = other.type;
		damage.dice = `${damage.number ?? 1}d${damage.denomination ?? CONFIG.EverydayHeroes.diceSteps[0]}`;
		return damage;
	}
}
