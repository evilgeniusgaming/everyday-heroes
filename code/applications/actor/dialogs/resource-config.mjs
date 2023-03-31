import BaseConfig from "./base-config.mjs";

/**
 * Dialog for configuring an individual resources.
 * @param {string} resourceId - The ability being modified by this app.
 * @param {ActorEH} actor - The actor to whom the resource belongs.
 * @param {object} options - Additional application rendering options.
 */
export default class ResourceConfig extends BaseConfig {
	constructor(resourceId, actor, options) {
		super(actor, options);
		this.resourceId = resourceId ?? Object.keys(actor.system.resources)[0];
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["everyday-heroes", "config", "resource"],
			template: "systems/everyday-heroes/templates/actor/dialogs/resource-config.hbs",
			width: 500,
			height: "auto"
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * The resource being modified by this app.
	 * @type {string}
	 */
	resourceId;

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get type() {
		return this.document.system.resources[this.resourceId]?.label ?? "";
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Context Preparation                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async getData(options) {
		const context = await super.getData(options);
		context.resourceId = this.resourceId;
		context.resource = context.source.resources[this.resourceId]
			?? this.document.system.resources[this.resourceId] ?? null;
		context.faces = Object.fromEntries(CONFIG.EverydayHeroes.diceSteps.map(die => [die, `d${die}`]));
		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Action Handlers                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	activateListeners(jQuery) {
		super.activateListeners(jQuery);
		const html = jQuery[0];

		for ( const button of html.querySelectorAll("button") ) {
			button.addEventListener("click", this._onClickButton.bind(this));
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_onChangeInput(event) {
		super._onChangeInput(event);
		if ( event.target.name === "resourceId" ) {
			this.resourceId = event.target.value;
			this.render();
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle clicking on the create buttons.
	 * @param {ClickEvent} event - Triggering click event.
	 */
	async _onClickButton(event) {
		event.preventDefault();
		const { action, key } = event.currentTarget.dataset;

		switch (action) {
			case "add":
				let resource;
				if ( key ) {
					resource = CONFIG.EverydayHeroes.resources[key];
					this.resourceId = key;
				} else {
					const data = foundry.utils.expandObject(this._getSubmitData());
					if ( !data.custom.label ) return ui.notifications.warn(game.i18n.localize("EH.Resource.Config.Warning.NoLabel"));
					resource = data.custom;
					this.resourceId = resource.label.slugify({strict: true});
				}
				if ( !resource ) return;
				await this.document.update({[`system.resources.${this.resourceId}`]: resource});
				break;
			case "delete":
				await this.document.update({[`system.resources.-=${key}`]: null});
				break;
		}

		this.render();
	}
}
