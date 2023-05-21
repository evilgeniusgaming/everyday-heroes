/**
 * Roll configuration dialog.
 *
 * @param {BaseRollBuilder} [buildConfig] - Roll config builder.
 * @param {BaseRollConfiguration} [rollConfig={}] - Initial roll configuration.
 * @param {BaseConfigurationDialogOptions} [options={}] - Dialog rendering options.
 */
export default class BaseConfigurationDialog extends FormApplication {
	constructor(buildConfig, rollConfig={}, options={}) {
		super(null, options);

		/**
		 * Roll builder.
		 * @type {BaseRollBuilder}
		 */
		Object.defineProperty(this, "buildConfig", { value: buildConfig, writable: false, enumerable: true });

		/**
		 * Roll configuration.
		 * @type {BaseRollConfiguration}
		 */
		Object.defineProperty(this, "rollConfig", { value: rollConfig, writable: false, enumerable: true });

		this.object = this._buildRoll(foundry.utils.deepClone(this.rollConfig));
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			template: "systems/everyday-heroes/templates/dice/roll-dialog.hbs",
			classes: ["everyday-heroes", "dialog", "roll"],
			width: 400,
			submitOnChange: true,
			closeOnSubmit: false,
			jQuery: false,
			rollType: CONFIG.Dice.BaseRoll
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * The roll being configured.
	 * @type {BaseRoll}
	 */
	get roll() {
		return this.object;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get title() {
		return this.options.title ?? game.i18n.localize("EH.Roll.Configuration.LabelGeneric");
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Static Constructor                       */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * A helper constructor that displays the roll configuration dialog.
	 * @param {BaseRollConfiguration} [rollConfig] - Initial roll configuration.
	 * @param {BaseDialogConfiguration} [options] - Configuration information for the dialog.
	 * @returns {Promise}
	 */
	static async configure(rollConfig={}, options={}) {
		return new Promise((resolve, reject) => {
			new this(
				options.buildConfig,
				rollConfig,
				foundry.utils.mergeObject({ resolve, reject }, options.options)
			).render(true);
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Context Preparation                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Buttons displayed in the configuration dialog.
	 * @returns {object}
	 * @protected
	 */
	getButtons() {
		return {
			roll: {
				label: game.i18n.localize("EH.Dice.Action.Roll")
			}
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	getData(options={}) {
		return foundry.utils.mergeObject({
			CONFIG: CONFIG.EverydayHeroes,
			default: this.options.default ?? {},
			formula: this._getFormula(),
			rollModes: CONFIG.Dice.rollModes,
			bonus: this.roll.data.bonus,
			buttons: this.getButtons()
		}, super.getData(options));
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Action Handlers                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	activateListeners(jQuery) {
		super.activateListeners(jQuery);
		const html = jQuery[0];
		for ( const button of html.querySelectorAll("button[data-action]") ) {
			button.addEventListener("click", this._onButtonAction.bind(this));
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async close(options={}) {
		this.options.reject?.();
		return super.close(options);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Final roll preparation based on the pressed button.
	 * @param {string} action - That button that was pressed.
	 * @returns {BaseRoll}
	 */
	finalizeRoll(action) {
		return this.roll;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	submit(button, event) {
		event?.preventDefault();
		super.submit(button, event);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Build a roll from the provided config.
	 * @param {BaseRollConfiguration} config - Roll configuration data.
	 * @param {object} formData - Data provided by the configuration form.
	 * @returns {BaseRoll}
	 */
	_buildRoll(config, formData={}) {
		config = foundry.utils.mergeObject({parts: [], data: {}, options: {}}, config);
		if ( this.buildConfig ) config = this.buildConfig(config, formData);

		if ( formData.bonus ) {
			config.parts.push("@bonus");
			config.data.bonus = formData.bonus;
		}

		if ( formData.rollMode ) {
			config.options.rollMode = formData.rollMode;
		}

		const RollType = this.options.rollType ?? Roll;
		return RollType.create(config);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Format the roll's formula for display.
	 * @returns {string}
	 * @internal
	 */
	_getFormula() {
		const formula = this.roll.formula;
		if ( this.roll.data.bonus ) return formula;
		else if ( formula ) return `${formula} + @bonus`;
		else return "@bonus";
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle clicks to the buttons.
	 * @param {HTMLEvent} event - Triggering click event.
	 */
	_onButtonAction(event) {
		const roll = this.finalizeRoll(event.currentTarget.dataset.action);
		this.options.resolve?.(roll);
		this.close({submit: false, force: true});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_updateObject(event, formData) {
		this.object = this._buildRoll(foundry.utils.deepClone(this.rollConfig), formData);
		this.render();
	}
}
