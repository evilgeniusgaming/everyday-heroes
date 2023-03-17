import BaseConfigurationDialog from "./base-configuration-dialog.mjs";

/**
 * Base roll configuration data.
 *
 * @typedef {object} BaseRollConfiguration
 * @property {string[]} [parts=[]] - Parts used to construct the roll formula.
 * @property {object} [data={}] - The roll data used to resolve the formula.
 * @property {Event} [event] - Event that triggered the roll.
 * @property {object} [options] - Options passed through to the roll.
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
 * @property {string} [template] - Override the default configuration template.
 * @property {object} [default]
 * @property {number} [default.rollMode] - The roll mode that is selected by default.
 * @property {object} [options] - Additional options passed through to the configuration dialog.
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
	 * Apply any type-specific configuration changes during the roll build process. Called before the configuration
	 * dialog is displayed, if one is set to be shown.
	 * @param {BaseRoll} roll - The roll being built.
	 * @param {BaseRollConfiguration} config - Roll configuration data.
	 * @param {BaseMessageConfiguration} message - Configuration data that guides roll message creation.
	 * @param {BaseDialogConfiguration} options - Data for the roll configuration dialog.
	 */
	static async buildConfiguration(roll, config, message, options) {
		// TODO: Determine whether the configuration dialog should be displayed
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Construct and perform a Base Roll through the standard workflow.
	 * @param {BaseRollConfiguration} [config={}] - Roll configuration data.
	 * @param {BaseMessageConfiguration} [message={}] - Configuration data that guides roll message creation.
	 * @param {BaseDialogConfiguration} [options={}] - Data for the roll configuration dialog.
	 */
	static async build(config={}, message={}, options={}) {
		const formula = (config.parts ?? []).join(" + ");
		const roll = new this(formula, config.data, config.options);
		await this.buildConfiguration(roll, config, message, options);

		if ( options.configure !== false ) {
			try {
				await this.ConfigurationDialog.configure(roll, options);
				roll._formula = this.getFormula(roll.terms);
			} catch(err) {
				if ( !err ) return;
				throw err;
			}
		}

		roll._formula = this.getFormula(roll.terms);
		await roll.evaluate({async: true});

		if ( roll && (message.create !== false) ) await roll.toMessage(message.data, {
			rollMode: roll.options.rollMode ?? message.rollMode
		});
		return roll;
	}
}
