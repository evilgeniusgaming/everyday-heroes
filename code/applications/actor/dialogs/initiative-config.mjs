import BaseConfig from "./base-config.mjs";

/**
 * Dialog for configuring an actor's initiative.
 */
export default class InitiativeConfig extends BaseConfig {

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["everyday-heroes", "config", "initiative"],
			template: "systems/everyday-heroes/templates/actor/dialogs/initiative-config.hbs",
			width: 350,
			height: "auto"
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get type() {
		return game.i18n.localize("EH.Initiative.Label");
	}
}
