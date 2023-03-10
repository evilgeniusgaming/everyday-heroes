import Advancement from "./advancement.mjs";
import HitPointsConfig from "../../applications/advancement/hit-points-config.mjs";
import HitPointsFlow from "../../applications/advancement/hit-points-flow.mjs";
import { HitPointsConfigurationData, HitPointsValueData } from "../../data/advancement/hit-points-data.mjs";
import { simplifyBonus } from "../../utils.mjs";

/**
 * Advancement that presents the player with the option to roll hit points at each level or select the average value.
 * Keeps track of player hit point rolls or selection for each level. **Can only be added to archetypes and each
 * archetypes can only have one.**
 */
export default class HitPointsAdvancement extends Advancement {

	/** @inheritdoc */
	static get metadata() {
		return foundry.utils.mergeObject(super.metadata, {
			dataModels: {
				configuration: HitPointsConfigurationData,
				value: HitPointsValueData
			},
			order: 10,
			icon: "systems/everyday-heroes/artwork/svg/advancement/hit-points.svg",
			title: game.i18n.localize("EH.Advancement.HitPoints.Title"),
			hint: game.i18n.localize("EH.Advancement.HitPoints.Hint"),
			multiLevel: true,
			validItemTypes: new Set(["archetype"]),
			apps: {
				config: HitPointsConfig,
				flow: HitPointsFlow
			}
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Instance Properties                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get levels() {
		return Array.fromRange(CONFIG.EverydayHeroes.maxLevel + 1).slice(1);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Display Methods                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	configuredForLevel(level) {
		return this.valueForLevel(level) !== null;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	titleForLevel(level, { configMode=false }={}) {
		const hp = this.valueForLevel(level);
		if ( !hp || configMode ) return this.title;
		return `${this.title}: <strong>${hp}</strong>`;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Hit points given at the provided level.
	 * @param {number} level - Level for which to get hit points.
	 * @returns {number|null} - Hit points for level or null if none have been taken.
	 */
	valueForLevel(level) {
		return this.constructor.valueForLevel(this.value.granted ?? {}, this.configuration.denomination, level);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Hit points given at the provided level.
	 * @param {object} data - Contents of `value` used to determine this value.
	 * @param {number} denomination - Face value of the hit die used by this advancement.
	 * @param {number} level - Level for which to get hit points.
	 * @returns {number|null} - Hit points for level or null if none have been taken.
	 */
	static valueForLevel(data, denomination, level) {
		const value = data[level];
		if ( !value ) return null;

		if ( value === "max" ) return denomination;
		if ( value === "avg" ) return (denomination / 2) + 1;
		return Number(value);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Total hit points provided by this advancement.
	 * @returns {number}  Hit points currently selected.
	 */
	total() {
		return Object.keys(this.value.granted ?? {}).reduce((t, l) => t + this.valueForLevel(parseInt(l)), 0);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Total hit points taking the provided ability modifier into account, with a minimum of 1 per level.
	 * @param {number} mod - Modifier to add per level.
	 * @returns {number} - Total hit points plus modifier.
	 */
	getAdjustedTotal(mod) {
		return Object.keys(this.value.granted ?? {}).reduce((total, level) => {
			return total + Math.max(this.valueForLevel(parseInt(level)) + mod, 1);
		}, 0);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Editing Methods                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static availableForItem(item) {
		return !item.system.advancement.byType("HitPoints").length;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Application Methods                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Add the ability modifier and any bonuses to the provided hit points value to get the number to apply.
	 * @param {number} value - Hit points taken at a given level.
	 * @returns {number} - Hit points adjusted with ability modifier and per-level bonuses.
	 */
	#getApplicableValue(value) {
		const abilityId = CONFIG.EverydayHeroes.defaultAbilities.hitPoints || "con";
		value = Math.max(value + (this.actor.system.abilities[abilityId]?.mod ?? 0), 1);
		value += simplifyBonus(this.actor.system.attributes.hp.bonuses.level, this.actor.getRollData());
		return value;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	apply(level, data) {
		let value = this.constructor.valueForLevel(data, this.configuration.denomination, level);
		if ( value === undefined ) return;
		this.actor.updateSource({
			"system.attributes.hp.value": this.actor.system.attributes.hp.value + this.#getApplicableValue(value)
		});
		this.updateSource({ "value.granted": data });
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	restore(level, data) {
		this.apply(level, data);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	reverse(level) {
		let value = this.valueForLevel(level);
		if ( value === undefined ) return;
		this.actor.updateSource({
			"system.attributes.hp.value": this.actor.system.attributes.hp.value - this.#getApplicableValue(value)
		});
		const source = { [level]: this.value[level] };
		this.updateSource({ [`value.granted.-=${level}`]: null });
		return source;
	}
}
