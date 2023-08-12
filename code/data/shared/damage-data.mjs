/**
 * Data model for base damage.
 *
 * @property {number} number - Number of dice rolled.
 * @property {number} denomination - Denomination of damage dice.
 * @property {string} type - Type of damage.
 */
export default class DamageData extends foundry.abstract.DataModel {

	static defineSchema() {
		return {
			number: new foundry.data.fields.NumberField({
				initial: null, min: 0, integer: true,
				label: "EH.Equipment.Trait.Damage.Count.Label", hint: "EH.Equipment.Trait.Damage.Count.Hint"
			}),
			denomination: new foundry.data.fields.NumberField({
				initial: null, min: 0, integer: true,
				label: "EH.Equipment.Trait.Damage.Denomination.Label", hint: "EH.Equipment.Trait.Damage.Denomination.Hint",
				suggestions: CONFIG.EverydayHeroes.diceSteps
			}),
			type: new foundry.data.fields.StringField({
				label: "EH.Equipment.Trait.Damage.Type.Label", hint: "EH.Equipment.Trait.Damage.Type.Hint",
				suggestions: CONFIG.EverydayHeroes.damageTypes
			})
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
		return this.parent?.actor;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareBaseData() {
		// Have to manually reset these values here to fix issue with Foundry calling prepareDerivedData twice
		this.number = this._source.number;
		this.denomination = this._source.denomination;
		if ( this.denomination ) this.dice = `${this.number ?? 1}d${this.denomination}`;
		else this.dice = this.number || 1;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Helper Methods                           */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * The average damage performed with the formula.
	 * @param {number} [mod=0] - Additional modifier to apply.
	 * @returns {number}
	 */
	average(mod=0) {
		if ( !this.denomination ) return this.number || 1;
		return Math.floor((this.denomination + 1) / 2 * this.number) + mod;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Formatted formula for this damage.
	 * @param {number} [mod=0] - Additional modifier to apply.
	 * @returns {string}
	 */
	formula(mod=0) {
		if ( !mod ) return this.dice;
		return `${this.dice} + ${mod}`;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Modify this item's damage with changes from a "modification" damage object.
	 * @param {object} modification - Changes to make to this item's data.
	 */
	modify(modification) {
		this.number += modification.number ?? 0;
		if ( this.number <= 0 ) {
			this.number = null;
			this.denomination = null;
		} else {
			this.denomination = EverydayHeroes.dice.utils.stepDenomination(
				this.denomination, modification.denomination
			);
		}
		if ( modification.type ) this.type = modification.type;
		if ( this.denomination ) this.dice = `${this.number ?? 1}d${this.denomination}`;
		else this.dice = this.number || 1;
	}
}
