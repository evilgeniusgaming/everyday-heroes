import { numberFormat } from "../../utils.mjs";
import AdvancementConfig from "./advancement-config.mjs";

/**
 * Configuration application for ability score assignment.
 */
export default class AbilityScoresConfig extends AdvancementConfig {

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["everyday-heroes", "advancement", "config", "ability-scores"],
			template: "systems/everyday-heroes/templates/advancement/ability-scores-config.hbs"
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	getData(options) {
		const context = foundry.utils.mergeObject({
			showLevelSelector: false,
			maximums: {},
			pointBuy: this.advancement.configuration.pointBuy
		}, super.getData(options));

		let abilityCount = 0;
		for ( const [key, config] of Object.entries(CONFIG.EverydayHeroes.abilities) ) {
			if ( config.assignment ) abilityCount++;
			context.maximums[key] = {
				label: config.label,
				value: this.advancement.configuration.maximums[key]
			};
		}
		context.rolls = Array(abilityCount)
			.fill()
			.map((e, index) => ({
				...this.advancement.configuration.rolling[index],
				label: game.i18n.format("EH.Advancement.AbilityScores.Rolling.Roll", {
					number: numberFormat(index + 1), ordinal: numberFormat(index + 1, { ordinal: true })
				})
			}));
		context.startingArray = Array(abilityCount).fill()
			.map((e, index) => this.advancement.configuration.startingArray[index])
			.sort((lhs, rhs) => (rhs ?? -Infinity) - (lhs ?? -Infinity));

		return context;
	}
}
