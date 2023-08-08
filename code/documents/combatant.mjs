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

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Reset combat related item usage.
	 * @param {string[]} types - Which types of uses to reset.
	 * @returns {Promise<Combatant>}
	 */
	async resetCombatUses(types) {
		const updates = [];
		for ( const item of this.actor.items ) {
			if ( !item.system.consumesUses
				|| item.system.uses.spent === 0
				|| !types.includes(item.system.uses.period) ) continue;
			updates.push({_id: item.id, "system.uses.spent": 0});
		}
		if ( updates.length ) await this.actor.updateEmbeddedDocuments("Item", updates);
		return this;
	}
}
