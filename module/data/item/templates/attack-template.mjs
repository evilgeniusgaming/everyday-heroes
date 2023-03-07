/**
 * Data model template for items that make attacks. Does not introduce any fields of its own, but provides
 * some data preparation methods and helpers.
 */
export default class AttackTemplate extends foundry.abstract.DataModel {

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Getters                                  */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Can attack rolls be performed by this item?
	 * @type {boolean}
	 */
	get hasAttack() {
		return true;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Helper Methods                           */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Ability modifier used by this item when making attacks.
	 * @param {string} type - Attack type (e.g. "melee", "ranged", "burst", "thrown").
	 * @returns {string|null}
	 */
	attackAbility(type) {
		return null;
	}
}
