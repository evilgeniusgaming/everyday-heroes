import BaseConfigurationDialog from "./base-configuration-dialog.mjs";

/**
 * Base roll configuration data.
 *
 * @typedef {object} BaseRollConfiguration
 * @property {string[]} [parts=[]] - Parts used to construct the roll formula.
 * @property {object} [data={}] - The roll data used to resolve the formula.
 * @property {Event} [event] - Event that triggered the roll.
 * @property {BaseRollOptions} [options] - Options passed through to the roll.
 */

/**
 * Options that describe a base roll.
 *
 * @typedef {object} BaseRollOptions
 * @property {number} [target] - The total roll result that must be met for the roll to be considered a success.
 */

/**
 * Message configuration data used when creating messages.
 *
 * @typedef {object} BaseMessageConfiguration
 * @property {boolean} [create=true] - Should a message be created when this roll is complete?
 * @property {string} [rollMode] - The roll mode to apply to this message from `CONFIG.Dice.rollModes`.
 * @property {object} [data={}] - Additional data used when creating the message.
 */

/**
 * Data for the roll configuration dialog.
 *
 * @typedef {object} BaseDialogConfiguration
 * @property {boolean} [configure=true] - Should the roll configuration dialog be displayed?
 * @property {BaseRollBuilder} [rollBuilder] - Method for constructing a roll from roll configuration.
 * @property {BaseConfigurationDialogOptions} [options] - Additional options passed through to the configuration dialog.
 */

/**
 * Dialog rendering options for roll configuration dialogs.
 *
 * @typedef {DialogOptions} BaseConfigurationDialogOptions
 * @property {object} default
 * @property {number} default.rollMode - The roll mode that is selected by default.
 * @property {typeof BaseRoll} rollType - Roll type to use when constructing final roll.
 * @property {*} resolve - Method to call when resolving successfully.
 * @property {*} reject - Method to call when the dialog is closed or process fails.
 */

/**
 * Method for constructing a roll from the provided roll configuration.
 *
 * @callback BaseRollBuilder
 * @param {BaseRollConfiguration} config - Roll configuration data.
 * @param {object} formData - Data provided by the configuration form.
 * @returns {BaseRoll}
 */

/**
 * Custom roll type that allows rolls in chat messages to be revived as the correct roll type.
 * @param {string} formula - The formula used to construct the roll.
 * @param {object} data - The roll data used to resolve the formula.
 * @param {object} options - Additional options that describe the roll.
 */
export default class BaseRoll extends Roll {
	constructor(formula, data, options={}) {
		super(formula, data, options);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Application to use for configuring this roll.
	 * @type {typeof BaseConfigurationDialog}
	 */
	static ConfigurationDialog = BaseConfigurationDialog;

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Static Constructor                       */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Create a roll instance from the provided config.
	 * @param {BaseRollConfiguration} config - Roll configuration data.
	 * @returns {BaseRoll}
	 */
	static create(config) {
		const formula = (config.parts ?? []).join(" + ");
		return new this(formula, config.data, config.options);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Construct and perform a Base Roll through the standard workflow.
	 * @param {BaseRollConfiguration} [config={}] - Roll configuration data.
	 * @param {BaseMessageConfiguration} [message={}] - Configuration data that guides roll message creation.
	 * @param {BaseDialogConfiguration} [options={}] - Data for the roll configuration dialog.
	 */
	static async build(config={}, message={}, options={}) {
		this.applyKeybindings(config, options);

		let roll;
		if ( options.configure !== false ) {
			try {
				roll = await this.ConfigurationDialog.configure(config, options);
				roll._formula = this.getFormula(roll.terms);
			} catch(err) {
				if ( !err ) return;
				throw err;
			}
		} else {
			roll = this.create(config);
		}

		await roll.evaluate({async: true});

		if ( roll && (message.create !== false) ) await roll.toMessage(message.data, {
			rollMode: roll.options.rollMode ?? message.rollMode
		});
		return roll;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Determines whether the roll should be fast forwarded.
	 * @param {BaseRollConfiguration} config - Roll configuration data.
	 * @param {BaseDialogConfiguration} options - Data for the roll configuration dialog.
	 */
	static applyKeybindings(config, options) {
		options.configure ??= true;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Is the result of this roll a failure? Returns `undefined` if roll isn't evaluated.
	 * @type {boolean|void}
	 */
	get isFailure() {
		if ( !this._evaluated ) return undefined;
		if ( !Number.isNumeric(this.options.target) ) return false;
		return this.total < this.options.target;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Is the result of this roll a success? Returns `undefined` if roll isn't evaluated.
	 * @type {boolean|void}
	 */
	get isSuccess() {
		if ( !this._evaluated ) return undefined;
		if ( !Number.isNumeric(this.options.target) ) return false;
		return this.total >= this.options.target;
	}
}
