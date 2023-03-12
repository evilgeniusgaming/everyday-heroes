import BaseRoll from "./base-roll.mjs";

/**
 * Challenge roll configuration data.
 *
 * @typedef {BaseRollConfiguration} ChallengeRollConfiguration
 * @property {string[]} [parts=[]] - Parts used to construct the roll formula, not including the challenge die.
 * @property {ChallengeRollOptions} [options] - Options passed through to the roll.
 */

/**
 * Options that describe a challenge roll.
 *
 * @typedef {object} ChallengeRollOptions
 * @property {boolean} [advantage] - Is the roll is granted advantage?
 * @property {boolean} [disadvantage] - Is the roll granted disadvantage?
 * @property {number} [criticalSuccess] - The value of the challenge die to be considered a critical success.
 * @property {number} [criticalFailure] - The value of the challenge die to be considered a critical failure.
 * @property {number} [target] - The total roll result that must be met for the roll to be considered a success.
 */

/**
 * Roll used for challenges and contests, usually using a D20, such as attacks, checks, and saves.
 * @param {string} formula - The formula used to construct the roll.
 * @param {object} data - The roll data used to resolve the formula.
 * @param {ChallengeRollOptions} options - Additional options that describe the challenge roll.
 */
export default class ChallengeRoll extends BaseRoll {
	constructor(formula, data, options={}) {
		super(formula, data, options);
		this.#createChallengeDie();
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Static Constructor                       */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Construct and perform a Challenge Roll through the standard workflow.
	 * @param {ChallengeRollConfiguration} config - Roll configuration data.
	 * @param {BaseMessageConfiguration} message - Configuration data that guides roll message creation.
	 */
	static async build(config={}, message={}) {
		const formula = [(new CONFIG.Dice.ChallengeDie()).formula].concat(config.parts ?? []).join(" + ");

		config.options ??= {};
		config.options.criticalSuccess ??= CONFIG.Dice.ChallengeDie.CRITICAL_SUCCESS_TOTAL;
		config.options.criticalFailure ??= CONFIG.Dice.ChallengeDie.CRITICAL_FAILURE_TOTAL;

		const roll = new this(formula, config.data, config.options);

		// TODO: Roll configuration dialog

		await roll.evaluate({async: true});

		if ( roll && (message.create !== false) ) await roll.toMessage(message.data, {
			rollMode: message.rollMode
		});
		return roll;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Instance Properties                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * The primary die used in this challenge.
	 * @type {ChallengeDie|void}
	 */
	get challengeDie() {
		if ( !(this.terms[0] instanceof Die) ) return undefined;
		return this.terms[0];
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Set the challenge die for this roll.
	 */
	set challengeDie(die) {
		if ( !(die instanceof CONFIG.Dice.ChallengeDie) ) throw new Error(
			`Challenge die must be an instance of ${CONFIG.Dice.ChallengeDie.name}, `
			+ `instead a ${die.constructor.name} was provided.`
		);
		this.terms[0] = die;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Is this challenge roll performed with advantage?
	 * @type {boolean}
	 */
	get hasAdvantage() {
		return this.options.advantageMode === this.constructor.MODES.ADVANTAGE;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Is this challenge roll performed with disadvantage?
	 * @type {boolean}
	 */
	get hasDisadvantage() {
		return this.options.advantageMode === this.constructor.MODES.DISADVANTAGE;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Is the result of this roll a critical success? Returns `undefined` if roll isn't evaluated.
	 * @type {boolean|void}
	 */
	get isCriticalSuccess() {
		return this.challengeDie.isCriticalSuccess;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Is the result of this roll a critical failure? Returns `undefined` if roll isn't evaluated.
	 * @type {boolean|void}
	 */
	get isCriticalFailure() {
		return this.challengeDie.isCriticalFailure;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Is the result of this roll a failure? Returns `undefined` if roll isn't evaluated.
	 * @type {boolean|void}
	 */
	get isFailure() {
		if ( !this.isValidRoll || !this._evaluated ) return undefined;
		if ( !Number.isNumeric(this.options.target) ) return false;
		return this.total < this.options.target;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Is the result of this roll a success? Returns `undefined` if roll isn't evaluated.
	 * @type {boolean|void}
	 */
	get isSuccess() {
		if ( !this.isValidRoll || !this._evaluated ) return undefined;
		if ( !Number.isNumeric(this.options.target) ) return false;
		return this.total >= this.options.target;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Is this a valid challenge role?
	 * @type {boolean}
	 */
	get isValidRoll() {
		return (this.challengeDie instanceof CONFIG.Dice.ChallengeDie) && this.challengeDie.isValid;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Roll Configuration                       */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Ensure the challenge die for this roll is a proper ChallengeDie, not a regular Die.
	 */
	#createChallengeDie() {
		if ( this.challengeDie instanceof CONFIG.Dice.ChallengeDie ) return;
		if ( !(this.challengeDie instanceof Die) ) return;
		const cd = this.challengeDie = new CONFIG.Dice.ChallengeDie({...this.challengeDie});
		if ( this.options.criticalSuccess ) cd.options.criticalSuccess = this.options.criticalSuccess;
		if ( this.options.criticalFailure ) cd.options.criticalFailure = this.options.criticalFailure;
		if ( this.options.target ) cd.options.target = this.options.target;
	}
}
