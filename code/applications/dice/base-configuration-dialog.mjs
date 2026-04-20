/**
 * Roll configuration dialog.
 *
 * @param {BaseRollBuilder} [buildConfig] - Roll config builder.
 * @param {BaseRollConfiguration[]} [rollConfig=[]] - Initial roll configurations.
 * @param {BaseConfigurationDialogOptions} [options={}] - Dialog rendering options.
 */
export default class BaseConfigurationDialog extends FormApplication {
	constructor(buildConfig, rollConfig=[], { message, ...options }={}) {
		super(null, options);

		/**
		 * Roll builder.
		 * @type {BaseRollBuilder}
		 */
		Object.defineProperty(this, "buildConfig", { value: buildConfig, writable: false, enumerable: true });

		/**
		 * Roll configurations.
		 * @type {BaseRollConfiguration[]}
		 */
		Object.defineProperty(this, "rollConfig", { value: rollConfig, writable: false, enumerable: true });

		this.object = this._buildRolls(foundry.utils.deepClone(this.rollConfig));
		this.#message = message;
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
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Configuration information for the roll message.
	 * @type {BasicRollMessageConfiguration}
	 */
	#message;

	get message() {
		return this.#message;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * The rolls being configured.
	 * @type {BaseRoll[]}
	 */
	get rolls() {
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
	 * @param {BaseRollConfiguration[]} [config={}] - Initial roll configuration.
	 * @param {BaseDialogConfiguration} [dialog={}] - Roll dialog configuration.
	 * @param {BaseMessageConfiguration} [message={}] - Message configuration.
	 * @returns {Promise}
	 */
	static async configure(config={}, dialog={}, message={}) {
		return new Promise((resolve, reject) => {
			new this(
				dialog.buildConfig,
				config,
				{ ...dialog.options, message, resolve, reject }
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
			rolls: this.rolls,
			rollMode: this.message.rollMode ?? this.options.default?.rollMode ?? CONFIG.Dice.BaseRoll.getMessageMode(),
			rollModes: Object.entries(CONFIG.ChatMessage.modes)
				.filter(([k]) => k !== "ic")
				.map(([value, { label }]) => ({ value, label: _loc(label) })),
			bonus: this.rolls[0].data.bonus,
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
	 * @returns {BaseRoll[]}
	 */
	finalizeRolls(action) {
		return this.rolls;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	submit(button, event) {
		event?.preventDefault();
		super.submit(button, event);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare individual config in order to build rolls.
	 * @param {BaseRollConfiguration} config - Roll configuration data.
	 * @param {object} formData - Data provided by the configuration form.
	 * @returns {BaseRollConfiguration}
	 */
	_prepareConfig(config, formData) {
		config = foundry.utils.mergeObject({parts: [], data: {}, options: {}}, config);
		if ( this.buildConfig ) config = this.buildConfig(config, formData);

		if ( formData.bonus && (config.extraTerms !== false) ) {
			config.parts.push("@bonus");
			config.data.bonus = formData.bonus;
		}

		if ( formData.rollMode ) {
			config.options.rollMode = formData.rollMode;
		}

		return config;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Build a roll from the provided config.
	 * @param {BaseRollConfiguration[]} configs - Roll configuration data.
	 * @param {object} formData - Data provided by the configuration form.
	 * @returns {BaseRoll[]}
	 */
	_buildRolls(configs, formData={}) {
		const RollType = this.options.rollType ?? Roll;
		return configs.map(c => RollType.create(this._prepareConfig(c, formData)));
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle clicks to the buttons.
	 * @param {HTMLEvent} event - Triggering click event.
	 */
	_onButtonAction(event) {
		const rolls = this.finalizeRolls(event.currentTarget.dataset.action);
		this.options.resolve?.(rolls);
		this.close({submit: false, force: true});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_updateObject(event, formData) {
		if ( formData.rollMode ) this.message.rollMode = formData.rollMode;
		this.object = this._buildRolls(foundry.utils.deepClone(this.rollConfig), formData);
		this.render();
	}
}
