import BaseConfig from "./base-config.mjs";

/**
 * Dialog for configuring an actor's speed.
 */
export default class SpeedConfig extends BaseConfig {

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["everyday-heroes", "config", "speed"],
			template: "systems/everyday-heroes/templates/actor/dialogs/speed-config.hbs",
			width: 500,
			height: "auto"
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get type() {
		return game.i18n.localize("EH.Speed.Label");
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Action Handlers                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async _updateObject(event, formData) {
		const updates = foundry.utils.expandObject(formData);
		const specials = foundry.utils.getProperty(updates, "system.attributes.movement.special");
		for ( const [key, value] of Object.entries(specials) ) {
			if ( value ) continue;
			delete specials[key];
			specials[`-=${key}`] = null;
		}
		return this.object.update(updates);
	}
}
