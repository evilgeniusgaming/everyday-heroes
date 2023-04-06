/**
 * Data model template for items that cause damage.
 *
 * @property {number} number - Number of dice rolled.
 * @property {number} denomination - Denomination of damage dice.
 * @property {string} type - Type of damage.
 */
export default class Damage extends foundry.abstract.DataModel {

	static defineSchema() {
		return {
			number: new foundry.data.fields.NumberField({
				initial: null, min: 0, integer: true, label: "EH.Equipment.Trait.Damage.Count.Label"
			}),
			denomination: new foundry.data.fields.NumberField({
				initial: null, min: 0, integer: true, label: "EH.Equipment.Trait.Damage.Denomination.Label"
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
		// TODO: Move this into damageTemplate to take advantage of mode
		const ability = this._actor?.system.abilities[this.parent?.damageAbility]?.mod ?? 0;
		if ( !this.denomination ) return this.number;
		return Math.floor(this.denomination / 2 * this.number) + ability;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareBaseData() {
		// Have to manually reset these values here to fix issue with Foundry calling prepareDerivedData twice
		this.number = this._source.number;
		this.denomination = this._source.denomination;
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
		if ( this.denomination ) this.dice = `${this.number ?? 1}d${this.denomination}`;
		else this.dice = this.number ?? 0;
	}
}
