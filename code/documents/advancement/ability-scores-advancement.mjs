import AbilityScoresConfig from "../../applications/advancement/ability-scores-config.mjs";
import AbilityScoresFlow from "../../applications/advancement/ability-scores-flow.mjs";
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
				config: AbilityScoresConfig,
				flow: AbilityScoresFlow
			}
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Helpers                                  */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Construct a roll formula based on the provided rolling config.
	 * @param {AbilityScoreRollConfigurationData} config - Configuration for a roll.
	 * @returns {string}
	 */
	buildRollFormula(config) {
		const formulaConfig = CONFIG.EverydayHeroes.abilityScoreAssignment.rollingFormulas[config.formula];
		return formulaConfig ? config.bonus ? `${formulaConfig.formula} + ${config.bonus}` : formulaConfig.formula : "";
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Application Methods                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Determine what the final score should be for an ability based on the selected method.
	 * @param {number} assignment - Assignment value for this ability.
	 * @param {string} method - Ability assignment method selected.
	 * @param {Roll[]} rolls - Any rolls performed.
	 * @returns {number|null}
	 */
	calculateAssignmentValue(assignment, method, rolls) {
		switch (method) {
			case "startingArray":
				return this.configuration.startingArray[assignment] ?? null;
			case "pointBuy":
				return assignment ?? null;
			case "rolling":
				return rolls[assignment]?.total ?? null;
			default:
				return null;
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @override */
	async apply(level, data) {
		if ( !data.method ) throw new Advancement.ERROR(game.i18n.localize("EH.Advancement.AbilityScores.Error.NoMethod"));
		if ( data.method !== "pointBuy"
			&& new Set(Object.values(data.assignments)).size < Object.values(data.assignments).length ) {
			throw new Advancement.ERROR(game.i18n.localize("EH.Advancement.AbilityScores.Error.Duplicates"));
		}

		const abilities = {};
		for ( const [key] of Object.entries(CONFIG.EverydayHeroes.abilities).filter(([, c]) => c.assignment) ) {
			const score = this.calculateAssignmentValue(data.assignments[key], data.method, data.rolls);
			if ( score === null ) {
				throw new Advancement.ERROR(game.i18n.localize("EH.Advancement.AbilityScores.Error.Incomplete"));
			}
			abilities[key] = { value: (this.actor.system.abilities[key].value ?? 0) + score };
		}

		this.actor.updateSource({ "system.abilities": abilities });
		this.updateSource({ value: data });
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @override */
	async restore(level, data) {
		await this.apply(level, data);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @override */
	async reverse(level) {
		const abilities = {};
		for ( const [key] of Object.entries(CONFIG.EverydayHeroes.abilities).filter(([, c]) => c.assignment) ) {
			const score = this.calculateAssignmentValue(this.value.assignments[key], this.value.method, this.value.rolls);
			const finalValue = this.actor.system.abilities[key].value - score;
			abilities[key] = { value: finalValue > 0 ? finalValue : null };
		}

		const retainedData = this.value;
		this.actor.updateSource({ "system.abilities": abilities });
		this.updateSource({ "value.-=method": null, "value.-=rolls": null, "value.-=assignments": null });
		return retainedData;
	}
}
