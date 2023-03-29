import BaseConfig from "./base-config.mjs";

/**
 * Dialog for configuring an individual ability.
 * @param {string} abilityId - The ability being modified by this app.
 * @param {ActorEH} actor - The actor to whom the ability belongs.
 * @param {object} options - Additional application rendering options.
 */
export default class AbilityConfig extends BaseConfig {
	constructor(abilityId, actor, options) {
		super(actor, options);
		this.abilityId = abilityId ?? Object.keys(CONFIG.EverydayHeroes.abilities)[0];
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["everyday-heroes", "config", "ability"],
			template: "systems/everyday-heroes/templates/actor/dialogs/ability-config.hbs",
			width: 500,
			height: "auto"
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * The ability being modified by this app.
	 * @type {string}
	 */
	abilityId;

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get type() {
		return CONFIG.EverydayHeroes.abilities[this.abilityId]?.label ?? "";
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Context Preparation                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async getData(options) {
		const context = await super.getData(options);
		context.abilityId = this.abilityId;
		context.ability = context.source.abilities[this.abilityId]
			?? this.document.system.abilities[this.abilityId] ?? {};
		context.proficiencyLevels = {
			0: game.i18n.localize("EH.Proficiency.Level.None"),
			1: game.i18n.localize("EH.Proficiency.Level.Proficient")
		};
		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Action Handlers                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_onChangeInput(event) {
		super._onChangeInput(event);
		if ( event.target.name === "abilityId" ) {
			this.abilityId = event.target.value;
			this.render();
		}
	}
}
