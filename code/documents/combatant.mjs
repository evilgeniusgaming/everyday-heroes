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

	getInitiativeRoll(formula) {
		return this.actor?._cachedInitiativeRoll?.clone()
			?? CONFIG.Dice.ChallengeRoll.create(this.actor?.getInitiativeRollConfig() ?? {})[0];
	}
}
