/**
 * Dialog for performing rests on actors.
 *
 * @param {ActorEH} actor - Actor that is taking the rest.
 * @param {DialogData} data
 * @param {RestConfiguration} data.config - Configuration information for the rest.
 * @param {DialogOptions} options - Dialog rendering options.
 */
export default class RestDialog extends Dialog {
	constructor(actor, data, options) {
		super(data, options);
		this.actor = actor;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Actor that is performing the rest.
	 * @type {ActorEH}
	 */
	actor;

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Result of the rest operation.
	 * @type {object}
	 */
	result = {};

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			template: "systems/everyday-heroes/templates/actor/dialogs/rest-dialog.hbs",
			classes: ["everyday-heroes", "dialog", "rest"]
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Static Constructor                       */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * A helper constructor that displays the appropriate rest dialog and returns user choices when complete.
	 * @param {ActorEH} actor - Actor that is taking the rest.
	 * @param {RestConfiguration} config - Configuration information for the rest.
	 * @returns {Promise}
	 */
	static async rest(actor, config) {
		const prefix = `EH.Rest.Type.${config.type.capitalize()}`;
		return new Promise((resolve, reject) => {
			const dialog = new this(actor, {
				config,
				title: game.i18n.localize(`${prefix}.Label`),
				content: game.i18n.localize(`${prefix}.Hint`),
				buttons: {
					rest: {
						icon: '<i class="fas fa-bed"></i>',
						label: game.i18n.localize("EH.Rest.Action.Rest.Label"),
						callback: jQuery => {
							resolve(dialog.result);
						}
					},
					cancel: {
						icon: '<i class="fas fa-times"></i>',
						label: game.i18n.localize("Cancel"),
						callback: reject
					}
				},
				default: "rest",
				close: reject
			});
			dialog.render(true);
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Context Preparation                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	getData(options={}) {
		const context = super.getData(options);
		context.config = this.data.config;
		context.result = this.result;
		context.hd = this.actor.system.attributes.hd;
		context.showHitDice = this.data.config.type === "short";
		context.showMedical = this.data.config.type === "short";
		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Action Handlers                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	activateListeners(jQuery) {
		super.activateListeners(jQuery);
		const html = jQuery[0];
		html.querySelector('[name="medical"]')?.addEventListener("change", e => {
			this.result.medicalAttention = e.target.value;
			this.render();
		});
		html.querySelector('[data-action="roll-hit-die"]')?.addEventListener("click", this._onRollHitDie.bind(this));
		html.querySelector('[data-action="roll-medicine"]')?.addEventListener("click", this._onRollMedicine.bind(this));
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	submit(button, event) {
		event.preventDefault();
		super.submit(button, event);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle rolling a Hit Die.
	 * @param {ClickEvent} event - The triggering click event.
	 */
	async _onRollHitDie(event) {
		event.preventDefault();
		await this.actor.rollHitDie({ advantage: this.result.medicalAttention === "receive" });
		this.render();
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle rolling a medicine check.
	 * @param {ClickEvent} event - The triggering click event.
	 */
	async _onRollMedicine(event) {
		event.preventDefault();
		// TODO: Ensure this can be rolled with advantage is assistance is provided
		const roll = await this.actor.rollSkill("medi", {
			ability: "int", options: { target: 10 },
			advantage: this.data.config.medicalAttention === "receive"
		}, { data: { "flags.everyday-heroes.medicalAttention": true } });
		this.result.medicalRoll = roll;
		this.render();
	}
}
