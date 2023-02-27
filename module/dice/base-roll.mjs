/**
 * Base roll configuration data.
 *
 * @typedef {object} BaseRollConfiguration
 * @property {string[]} [parts=[]] - Parts used to construct the roll formula.
 * @property {object} [data={}] - The roll data used to resolve the formula.
 * @property {Event} [event] - Event that triggered the roll.
 * @property {boolean} [fastForward] - Should roll configuration dialog be skipped?
 * @property {object} [options] - Options passed through to the roll.
 */

/**
 * Message configuration data used when creating roll messages.
 *
 * @typedef {object} RollMessageConfiguration
 * @property {boolean} [create=true] - Should a message be created when this roll is complete?
 * @property {string} [rollMode] - The roll mode to apply to this message from `CONFIG.Dice.rollModes`.
 * @property {object} [data={}] - Additional data used when creating the message.
 */

/**
 * Custom roll type that allows rolls in chat messages to be revived as the correct roll type.
 */
export default class BaseRoll extends Roll {
	constructor(...args) {
		super(...args);
		this.options._rollType = this.constructor.name;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Static Constructor                       */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Construct and perform a Base Roll through the standard workflow.
	 * @param {BaseRollConfiguration} config - Roll configuration data.
	 * @param {RollMessageConfiguration} message - Configuration data that guides roll message creation.
	 */
	static async build(config={}, message={}) {
		const formula = (config.parts ?? []).join(" + ");

		const roll = new this(formula, config.data, config.options);

		// TODO: Roll configuration dialog

		await roll.evaluate({async: true});

		if ( roll && (message.create !== false) ) await roll.toMessage(message.data, {
			rollMode: message.rollMode
		});
		return roll;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static create(formula, data={}, options={}) {
		const cls = CONFIG.Dice[options._rollType] ?? CONFIG.Dice.rolls[0];
		return new cls(formula, data, options);
	}
}
