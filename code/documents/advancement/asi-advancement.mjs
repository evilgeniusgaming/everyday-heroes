import Advancement from "./advancement.mjs";
import ASIConfig from "../../applications/advancement/asi-config.mjs";
import ASIFlow from "../../applications/advancement/asi-flow.mjs";
import { ASIConfigurationData, ASIValueData } from "../../data/advancement/asi-data.mjs";

/**
 * Advancement that presents the player with the option of improving their ability scores.
 */
export default class ASIAdvancement extends Advancement {

	static get metadata() {
		return foundry.utils.mergeObject(super.metadata, {
			dataModels: {
				configuration: ASIConfigurationData,
				value: ASIValueData
			},
			order: 20,
			icon: "systems/everyday-heroes/artwork/svg/advancement/asi.svg",
			title: game.i18n.localize("EH.Advancement.ASI.Title"),
			hint: game.i18n.localize("EH.Advancement.ASI.Hint"),
			apps: {
				config: ASIConfig,
				flow: ASIFlow
			}
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Instance Properties                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Information on the ASI points available.
	 * @type {{ assigned: number, total: number }}
	 */
	get points() {
		return {
			assigned: Object.values(this.value.improvements ?? {}).reduce((n, c) => n + c, 0),
			total: this.configuration.points + Object.values(this.configuration.fixed).reduce((t, v) => t + v, 0)
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Display Methods                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	summaryForLevel(level, { configMode=false }={}) {
		if ( !this.value.assignments ) return "";
		return Object.entries(this.value.assignments).reduce((html, [key, value]) => {
			const name = CONFIG.EverydayHeroes.abilities[key]?.label ?? key;
			html += `<span class="tag">${name} <strong>`;
			html += EverydayHeroes.utils.numberFormat(value, { sign: true });
			html += "</strong></span>\n";
			return html;
		}, "");
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Application Methods                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async apply(level, data) {
		const assignments = foundry.utils.mergeObject(this.configuration.fixed, data.assignments, {inplace: false});
		const updates = {};
		for ( const key of Object.keys(assignments) ) {
			const ability = this.actor.system.abilities[key];
			if ( !ability ) continue;
			assignments[key] = Math.min(assignments[key], ability.max - ability.value);
			if ( assignments[key] ) updates[`system.abilities.${key}.value`] = ability.value + assignments[key];
			else delete assignments[key];
		}
		data.assignments = assignments;
		this.actor.updateSource(updates);

		this.updateSource({value: data});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	restore(level, data) {
		this.apply(level, data);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	reverse(level) {
		const source = foundry.utils.deepClone(this.value);
		const updates = {};
		for ( const [key, change] of Object.entries(this.value.assignments ?? {}) ) {
			const ability = this.actor.system.abilities[key];
			if ( !ability ) continue;
			updates[`system.abilities.${key}.value`] = ability.value - change;
		}
		this.actor.updateSource(updates);
		this.updateSource({ "value.assignments": null });
		return source;
	}
}
