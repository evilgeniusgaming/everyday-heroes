import BaseConfig from "./base-config.mjs";

/**
 * Dialog for configuring an actor's hit dice, hit points, and death saves.
 */
export default class HealthConfig extends BaseConfig {
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["everyday-heroes", "config", "health"],
			template: "systems/everyday-heroes/templates/actor/dialogs/health-config.hbs",
			width: 500,
			height: "auto"
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get type() {
		return game.i18n.localize("EH.Health.Label");
	}
}
