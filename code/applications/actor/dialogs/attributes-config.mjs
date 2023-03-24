import BaseConfig from "./base-config.mjs";

/**
 * Dialog for configuring an actor's defense & initiative.
 */
export default class AttributesConfig extends BaseConfig {
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["everyday-heroes", "config", "attributes"],
			template: "systems/everyday-heroes/templates/actor/dialogs/attributes-config.hbs",
			width: 500,
			height: "auto"
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get type() {
		const formatter = new Intl.ListFormat(game.i18n.lang, {style: "short", type: "conjunction"});
		return formatter.format([game.i18n.localize("EH.Defense.Label"), game.i18n.localize("EH.Initiative.Label")]);
	}
}
