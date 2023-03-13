import AdvancementConfig from "./advancement-config.mjs";

/**
 * Configuration application for hit points.
 */
export default class HitPointsConfig extends AdvancementConfig {

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["everyday-heroes", "advancement", "config", "hit-points"],
			template: "systems/everyday-heroes/templates/advancement/hit-points-config.hbs"
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	getData(options) {
		const context = super.getData(options);
		context.diceSteps = Object.fromEntries(CONFIG.EverydayHeroes.diceSteps.map(n => [n, `d${n}`]));
		return context;
	}
}
