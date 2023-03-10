import ScaleValueConfig from "./scale-value-config.mjs";

/**
 * Configuration application for defense values.
 */
export default class DefenseConfig extends ScaleValueConfig {

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["everyday-heroes", "advancement", "config", "scale-value", "defense", "two-column"],
			template: "systems/everyday-heroes/templates/advancement/defense-config.hbs",
			width: 540
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	getData() {
		const abilities = foundry.utils.deepClone(CONFIG.EverydayHeroes.abilities);
		for ( const key of Object.keys(abilities) ) {
			abilities[key].checked = this.advancement.configuration.abilities.has(key);
		}
		return foundry.utils.mergeObject(super.getData(), { abilities });
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async prepareConfigurationUpdate(configuration) {
		configuration.abilities = Array.from(EverydayHeroes.utils.objectToSet(configuration.abilities));
		return await super.prepareConfigurationUpdate(configuration);
	}
}
