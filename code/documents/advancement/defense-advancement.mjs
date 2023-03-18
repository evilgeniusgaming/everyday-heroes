import ScaleValueAdvancement from "./scale-value-advancement.mjs";
import DefenseConfig from "../../applications/advancement/defense-config.mjs";
import { DefenseConfigurationData } from "../../data/advancement/defense-data.mjs";

/**
 * Advancement that represents a character's defense bonus.
 */
export default class DefenseAdvancement extends ScaleValueAdvancement {

	static get metadata() {
		return foundry.utils.mergeObject(super.metadata, {
			dataModels: {
				configuration: DefenseConfigurationData
			},
			order: 15,
			icon: "systems/everyday-heroes/artwork/svg/advancement/defense.svg",
			title: game.i18n.localize("EH.Advancement.Defense.Title"),
			hint: game.i18n.localize("EH.Advancement.Defense.Hint"),
			identifier: {
				configurable: false
			},
			validItemTypes: new Set(["archetype"]),
			apps: {
				config: DefenseConfig
			}
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Display Methods                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	titleForLevel(level, { configMode=false }={}) {
		const title = `${game.i18n.localize("EH.Defense.Label")} <em>(${this.title})</em>`;
		const value = this.valueForLevel(level)?.display;
		if ( !value ) return title;
		return `${title}: <strong>${value}</strong>`;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Editing Methods                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static availableForItem(item) {
		return !item.system.advancement.byType("Defense").length;
	}
}
