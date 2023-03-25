import { objectToSet } from "../../utils.mjs";
import AdvancementConfig from "./advancement-config.mjs";

/**
 * Configuration application for ability score improvements.
 */
export default class ASIConfig extends AdvancementConfig {

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["everyday-heroes", "advancement", "config", "asi"],
			template: "systems/everyday-heroes/templates/advancement/asi-config.hbs",
			width: 400
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	getData() {
		const fixed = {};
		const choices = {};
		for ( const [key, ability] of Object.entries(CONFIG.EverydayHeroes.abilities) ) {
			fixed[key] = {
				label: ability.label,
				checked: this.advancement.configuration.fixed.has(key),
				disabled: this.advancement.configuration.choices.has(key)
			};
			choices[key] = {
				label: ability.label,
				checked: this.advancement.configuration.choices.has(key),
				disabled: this.advancement.configuration.fixed.has(key)
			};
		}
		return foundry.utils.mergeObject({ fixed, choices }, super.getData());
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async prepareConfigurationUpdate(configuration) {
		// TODO: No need to coerce into array in v11
		configuration.fixed = Array.from(objectToSet(configuration.fixed));
		configuration.choices = Array.from(objectToSet(configuration.choices));
		return configuration;
	}
}
