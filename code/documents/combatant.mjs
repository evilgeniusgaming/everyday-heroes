/**
 * Extended version of `Combatant` class to support Everyday Heroes combat concepts.
 */
export default class CombatantEH extends Combatant {

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Getters                                  */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get isDefeated() {
		return this.actor?.system.attributes?.death?.status === "dead" ?? super.isDefeated;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Methods                                  */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Get a Roll object which represents the initiative roll for this Combatant.
	 * @param {string} [formula] - An explicit Roll formula to use for the combatant.
	 * @param {ChallengeRollOptions} [options={}] - Additional options to pass through to the roll.
	 * @returns {ChallengeRoll} - The unevaluated Roll instance to use for the combatant.
	 */
	getInitiativeRoll(formula, options={}) {
		if ( !this.actor ) return new CONFIG.Dice.ChallengeRoll("1d20", {}, options);

		const init = this.actor.system.attributes?.initiative ?? {};
		const abilityKey = init.ability ?? CONFIG.EverydayHeroes.defaultAbilities.initiative;
		const ability = this.actor.system.abilities?.[abilityKey] ?? {};

		const parts = ["1d20"];
		const data = this.actor.getRollData();

		if ( ability ) {
			parts.push("@mod");
			data.mod = ability.mod;
		}

		if ( init.prof?.hasProficiency ) {
			parts.push("@prof");
			data.prof = init.prof.term;
		}

		// Initiative-specific bonus
		if ( init.bonus ) {
			parts.push("@bonus");
			data.bonus = Roll.replaceFormulaData(init.bonus, data);
		}

		// Ability-specific check bonus
		if ( ability.bonuses?.check ) {
			parts.push(`@${abilityKey}Bonus`);
			data[`${abilityKey}Bonus`] = Roll.replaceFormulaData(ability.bonuses.check, data);
		}

		// Global ability check bonus
		if ( this.actor.system.bonuses?.ability?.check ) {
			parts.push("@globalBonus");
			data.globalBonus = Roll.replaceFormulaData(this.actor.system.bonuses.ability.check, data);
		}

		// Ability score tiebreaker
		if ( game.settings.get("everyday-heroes", "initiativeTiebreaker") && ability ) {
			parts.push("@tiebreaker");
			data.tiebreaker = ability.value / 100;
		}

		console.log("getInitiativeRoll", parts, data, options);
		return new CONFIG.Dice.ChallengeRoll(parts.join(" + "), data, options);
	}
}
