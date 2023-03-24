import { buildMinimum, buildRoll } from "../dice/utils.mjs";

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

		let { parts, data } = buildRoll({
			mod: ability.mod,
			prof: init.prof?.hasProficiency ? init.prof.term : null,
			bonus: init.bonus,
			[`${abilityKey}Bonus`]: ability.bonuses?.check,
			globalBonus: this.actor.system.bonuses?.ability?.check,
			tiebreaker: (game.settings.get("everyday-heroes", "initiativeTiebreaker") && ability) ? ability.value / 100 : null
		}, this.actor.getRollData());
		parts = ["1d20"].concat(parts);

		const rollOptions = foundry.utils.mergeObject({
			minimum: buildMinimum([
				ability?.minimums.check, this.actor.system.overrides?.ability?.minimums.check
			], data)
		}, options);

		return new CONFIG.Dice.ChallengeRoll(parts.join(" + "), data, rollOptions);
	}
}
