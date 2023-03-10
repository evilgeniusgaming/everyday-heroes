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
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Key for the ability that adds to damage rolls for this item, taking mode into account if it has one.
	 * @type {string|null}
	 */
	get damageAbility() {
		return null;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * The simplified damage formula for this item, taking mode into account if it has one.
	 * @type {string}
	 */
	get damageFormula() {
		if ( this.constructor.damageMode !== "regular" ) return "";
		const ability = this.parent?.actor?.system.abilities[this.damageAbility];
		if ( !ability?.mod ) return this.damage.dice;
		return `${this.damage.dice} + ${ability.mod}`;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Icon display on the damage button.
	 * @type {string}
	 */
	get damageIcon() {
		return "systems/everyday-heroes/artwork/svg/action/damage-melee.svg";
	}

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
	 * Tooltip displayed for damage button.
	 * @type {string}
	 */
	get damageTooltip() {
		return game.i18n.format("EH.Action.Roll", { type: game.i18n.localize("EH.Weapon.Action.DamageGeneric.Label") });
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
