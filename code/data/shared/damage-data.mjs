/**
 * Data model template for items that cause damage.
 *
 * @property {number} number - Number of dice rolled.
 * @property {number} denomination - Denomination of damage dice.
 * @property {string} type - Type of damage.
 */
export default class Damage extends foundry.abstract.DataModel {

	/**
	 * Damage mode to use when constructing the schema, either "regular" or "modification".
	 * @type {string}
	 */
	static mode = "regular";

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		return {
			number: new foundry.data.fields.NumberField({
				initial: null, min: this.damageMode === "regular" ? 0 : undefined, integer: true,
				label: "EH.Equipment.Trait.Damage.Count.Label"
			}),
			denomination: new foundry.data.fields.NumberField({
				initial: null, min: this.damageMode === "regular" ? 1 : undefined, integer: true,
				label: "EH.Equipment.Trait.Damage.Denomination.Label"
			}),
			type: new foundry.data.fields.StringField({label: "EH.Equipment.Trait.Damage.Type.Label"})
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Shortcut to the actor that contains this damage, if any.
	 * @type {ActorEH|void}
	 */
	get _actor() {
		return this.parent?.parent?.actor;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * The average damage performed with the formula.
	 * @type {number}
	 */
	get average() {
		const ability = this._actor?.system.abilities[this.parent?.damageAbility]?.mod ?? 0;
		if ( !this.denomination ) return this.number + ability;
		return (this.denomination / 2 * this.number) + ability;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * The simplified damage formula for this item, taking mode into account if it has one.
	 * @type {string}
	 */
	get formula() {
		if ( this.constructor.mode !== "regular" ) return "";
		// TODO: Take flat bonuses into account
		const ability = this._actor?.system.abilities[this.parent?.damageAbility];
		if ( !ability?.mod ) return this.dice;
		return `${this.dice} + ${ability.mod}`;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Is the damage defined on this item "regular" damage or a "modification" to another damage?
	 * @type {string}
	 */
	get mode() {
		return this.constructor.mode;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareBaseData() {
		// Have to manually reset these values here to fix issue with Foundry calling prepareDerivedData twice
		// this.number = this._source.number || 1;
		// this.denomination = this._source.denomination || CONFIG.EverydayHeroes.diceSteps[0];
		if ( this.denomination ) this.dice = `${this.number ?? 1}d${this.denomination}`;
		else this.dice = this.number ?? 0;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Helper Methods                           */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Modify this item's damage with changes from a "modification" damage object.
	 * @param {object} modification - Changes to make to this item's data.
	 */
	modify(modification) {
		this.number += modification.number ?? 0;
		this.denomination = EverydayHeroes.dice.utils.stepDenomination(
			this.denomination, modification.denomination
		);
		if ( modification.type ) this.type = modification.type;
		this.dice = `${this.number ?? 1}d${this.denomination}`;
	}
}
