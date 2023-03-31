/**
 * Object describing the proficiency for a specific ability or skill.
 *
 * @param {number} proficiency - Actor's flat proficiency bonus based on their current level.
 * @param {number} multiplier - Value by which to multiply the actor's base proficiency value.
 * @param {string} [rounding=down] - Should half-values be rounded up or down?
 */
export default class Proficiency {
	constructor(proficiency, multiplier, rounding) {

		/**
		 * Base proficiency value of the actor.
		 * @type {number}
		 * @private
		 */
		this._baseProficiency = Number(proficiency ?? 0);

		/**
		 * Value by which to multiply the actor's base proficiency value.
		 * @type {number}
		 */
		this.multiplier = Number(multiplier ?? 0);

		/**
		 * Direction decimal results should be rounded ("up" or "down").
		 * @type {string}
		 */
		this.rounding = rounding ?? "down";
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Calculate an actor's proficiency modifier based on level or CR.
	 * @param {number} level - Level or CR To use for calculating proficiency modifier.
	 * @returns {number} - Proficiency modifier.
	 */
	static calculateMod(level) {
		return Math.floor((level + 7) / 4);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Flat proficiency value regardless of proficiency mode.
	 * @type {number}
	 */
	get flat() {
		const roundMethod = (this.rounding === "down") ? Math.floor : Math.ceil;
		return roundMethod(this.multiplier * this._baseProficiency);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Dice-based proficiency value regardless of proficiency mode.
	 * @type {string}
	 */
	get dice() {
		if ( (this._baseProficiency === 0) || (this.multiplier === 0) ) return "0";
		const roundTerm = (this.rounding === "down") ? "floor" : "ceil";
		if ( this.multiplier === 0.5 ) {
			return `${roundTerm}(1d${this._baseProficiency * 2} / 2)`;
		} else {
			return `${this.multiplier}d${this._baseProficiency * 2}`;
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Proficiency term to use in dice rolls.
	 * @type {string}
	 */
	get term() {
		return String(this.flat);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Whether the proficiency is greater than zero.
	 * @type {boolean}
	 */
	get hasProficiency() {
		return (this._baseProficiency > 0) && (this.multiplier > 0);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Label based on the current proficiency mode.
	 * @type {string}
	 */
	get label() {
		return game.i18n.localize({
			0: "EH.Proficiency.Level.None",
			0.5: "EH.Proficiency.Level.Half",
			1: "EH.Proficiency.Level.Proficient",
			2: "EH.Proficiency.Level.Expertise"
		}[this.multiplier]);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Override the default `toString` method to return flat proficiency for backwards compatibility in formula.
	 * @returns {string} - Flat proficiency value.
	 */
	toString() {
		return this.term;
	}
}
