import AbilityScoresConfig from "../../applications/advancement/ability-scores-config.mjs";
import { AbilityScoresConfigurationData, AbilityScoresValueData } from "../../data/advancement/ability-scores-data.mjs";
import Advancement from "./advancement.mjs";

/**
 * Advancement that presents the player with the option of selecting their ability scores.
 */
export default class AbilityScoresAdvancement extends Advancement {

	static get metadata() {
		return foundry.utils.mergeObject(super.metadata, {
			dataModels: {
				configuration: AbilityScoresConfigurationData,
				value: AbilityScoresValueData
			},
			order: 1,
			icon: "systems/everyday-heroes/artwork/svg/advancement/ability-scores.svg",
			title: game.i18n.localize("EH.Advancement.AbilityScores.Title"),
			hint: game.i18n.localize("EH.Advancement.AbilityScores.Hint"),
			apps: {
				config: AbilityScoresConfig
			}
		});
	}

}
