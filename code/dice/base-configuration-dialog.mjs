/**
 * Roll configuration dialog.
 *
 * @param {BaseRoll} roll - Roll being configured.
 * @param {DialogData} data
 * @param {DialogOptions} options - Dialog rendering options.
 */
export default class BaseConfigurationDialog extends Dialog {
	constructor(roll, data, options) {
		super(data, options);
		this.roll = roll;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * The roll being configured.
	 * @type {BaseRoll}
	 */
	roll;

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			template: "systems/everyday-heroes/templates/dice/roll-dialog.hbs",
			classes: ["everyday-heroes", "dialog", "roll"],
			jQuery: false
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Static Constructor                       */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * A helper constructor that displays the roll configuration dialog.
	 * @param {BaseRoll} roll - Roll being configured.
	 * @param {BaseDialogConfiguration} options - Configuration information for the dialog.
	 * @returns {Promise}
	 */
	static async configure(roll, options) {
		return new Promise((resolve, reject) => {
			new this(roll, {
				title: options.options?.title ?? game.i18n.localize("EH.Roll.Configuration.LabelGeneric"),
				buttons: this._dialogButtons(roll, options, resolve, reject),
				default: "roll", // TODO: Allow this to be set
				close: () => reject()
			}, options.options).render(true);
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Buttons displayed in the configuration dialog.
	 * @param {BaseRoll} roll - Roll being configured.
	 * @param {BaseDialogConfiguration} options - Data for the roll configuration dialog.
	 * @param {*} resolve
	 * @param {*} reject
	 * @returns {object}
	 * @internal
	 */
	static _dialogButtons(roll, options, resolve, reject) {
		return {
			roll: {
				label: "Roll", // TODO: Localize
				callback: html => resolve(this._onDialogSubmit(roll, html))
			}
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Context Preparation                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	getData(options={}) {
		return foundry.utils.mergeObject({
			CONFIG: CONFIG.EverydayHeroes,
			default: this.options.default ?? {},
			formula: `${this.roll.formula} + @bonus`,
			rollModes: CONFIG.Dice.rollModes
		}, super.getData(options));
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Action Handlers                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	activateListeners(jQuery) {
		super.activateListeners(jQuery);
		const html = jQuery[0];
		// TODO: Adjust formula as bonus is modified
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	submit(button, event) {
		event?.preventDefault();
		super.submit(button, event);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle submission of the Roll evaluation configuration Dialog.
	 * @param {BaseRoll} roll - Roll being configured.
	 * @param {HTMLElement} html - The submitted dialog content.
	 * @param {object} [options={}] - Additional options passed from the dialog.
	 * @returns {BaseRoll} - The formed roll.
	 * @internal
	 */
	static _onDialogSubmit(roll, html, options={}) {
		const form = html.querySelector("form");

		if ( form.bonus.value ) {
			const bonus = new Roll(form.bonus.value, roll.data);
			if ( !(bonus.terms[0] instanceof OperatorTerm) ) roll.terms.push(new OperatorTerm({operator: "+"}));
			roll.terms = roll.terms.concat(bonus.terms);
		}

		roll.options.rollMode = form.rollMode.value;
		return roll;
	}
}
