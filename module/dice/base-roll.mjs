/**
 * Custom roll type that allows rolls in chat messages to be revived as the correct roll type.
 */
export default class BaseRoll extends Roll {
	constructor(...args) {
		super(...args);
		this.options._rollType = this.constructor.name;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static create(formula, data={}, options={}) {
		const cls = CONFIG.Dice[options._rollType] ?? CONFIG.Dice.rolls[0];
		return new cls(formula, data, options);
	}
}
