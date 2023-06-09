import { ASIConfigurationData } from "../../data/advancement/asi-data.mjs";
import TraitAdvancement from "./trait-advancement.mjs";

/**
 * Advancement that presents the player with the option of improving their ability scores.
 */
export default class ASIAdvancement extends TraitAdvancement {

	static get metadata() {
		return foundry.utils.mergeObject(super.metadata, {
			dataModels: {
				configuration: ASIConfigurationData
			},
			order: 20,
			icon: "systems/everyday-heroes/artwork/svg/advancement/asi.svg",
			title: game.i18n.localize("EH.Advancement.ASI.Title"),
			hint: game.i18n.localize("EH.Advancement.ASI.Hint")
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static get traits() {
		return {
			asi: {
				title: "EH.Advancement.ASI.Title",
				localization: "EH.Ability.Label",
				hintType: "EH.Ability.Label[other]",
				hintImprovement: "+1"
			}
		};
	}
}
