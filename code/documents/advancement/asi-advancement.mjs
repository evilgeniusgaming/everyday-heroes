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
			hint: game.i18n.localize("EH.Advancement.ASI.Hint"),
			validItemTypes: new Set(["background", "profession", "feat"])
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static get traits() {
		return {
			asi: {
				label: "EH.Advancement.ASI.Title",
				hintType: "EH.Ability.Label[other]",
				hintImprovement: "+1"
			}
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Display Methods                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	summaryForLevel(level, { configMode=false }={}) {
		// TODO: Display summary of fixed & choice while in config mode
		if ( !this.value.assignments ) return "";
		return Object.entries(this.value.assignments).reduce((html, [key, value]) => {
			const name = CONFIG.EverydayHeroes.abilities[key]?.label ?? key;
			html += `<span class="tag">${name} <strong>`;
			html += EverydayHeroes.utils.numberFormat(value, { sign: true });
			html += "</strong></span>\n";
			return html;
		}, "");
	}
}
