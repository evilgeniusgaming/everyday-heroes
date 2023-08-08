import BaseConfig from "./base-config.mjs";

/**
 * Dialog for configuring an actor's action economy.
 */
export default class ActionConfig extends BaseConfig {

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["everyday-heroes", "config", "action"],
			template: "systems/everyday-heroes/templates/actor/dialogs/action-config.hbs",
			width: 350,
			height: "auto"
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get type() {
		return game.i18n.localize("EH.Action.Econonmy");
	}
}
