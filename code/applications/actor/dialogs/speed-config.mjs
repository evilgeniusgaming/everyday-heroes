import { registerTagInputListeners } from "../../../utils.mjs";
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

	activateListeners(jQuery) {
		super.activateListeners(jQuery);
		registerTagInputListeners(this, jQuery[0]);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async _updateObject(event, formData) {
		const specials = foundry.utils.getProperty(
			foundry.utils.expandObject(formData), "system.attributes.movement.special"
		);
		for ( const [key, value] of Object.entries(specials) ) {
			if ( value ) continue;
			delete formData[`system.attributes.movement.special.${key}`];
			formData[`system.attributes.movement.special.-=${key}`] = null;
		}
		return this.object.update(formData);
	}
}
