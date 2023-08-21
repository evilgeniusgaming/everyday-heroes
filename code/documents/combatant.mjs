/**
 * Extended version of `Combatant` class to support Everyday Heroes combat concepts.
 */
export default class CombatantEH extends Combatant {

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Methods                                  */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	getInitiativeRoll(formula) {
		if ( formula ) return super.getInitiativeRoll(formula);
		const turnIdx = (this.getFlag("everyday-heroes", "turnOrder") ?? 1) - 1;
		return this.actor?._cachedInitiativeRolls?.[turnIdx].clone()
			?? CONFIG.Dice.ChallengeRoll.create(this.actor?.getInitiativeRollConfig() ?? {});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Reset combat related item usage.
	 * @param {string[]} types - Which types of uses to reset.
	 * @param {object} [options={}]
	 * @param {boolean} [options.start=false] - Is this the beginning of an encounter?
	 * @returns {Promise<Combatant>}
	 */
	async resetCombatUses(types, { start }={}) {
		// Reset cinematic actions
		const cinematicActions = this.actor?.system.details?.cinematicActions;
		if ( cinematicActions?.max ) {
			if ( start && types.includes("encounter") && (this.combat.combatant !== this) ) {
				await this.actor.update({"system.details.cinematicActions.spent": this.actor.system.details.cinematicActions.max});
			} else if ( types.includes("round") || types.includes("encounter") ) {
				await this.actor.update({"system.details.cinematicActions.spent": 0});
			}
		}

		// Reset relevant item updates
		const updates = [];
		for ( const item of this.actor?.items ?? [] ) {
			if ( !item.system.consumesUses
				|| item.system.uses.spent === 0
				|| !types.includes(item.system.uses.period) ) continue;
			updates.push({_id: item.id, "system.uses.spent": 0});
		}
		if ( updates.length ) await this.actor.updateEmbeddedDocuments("Item", updates);

		return this;
	}
}
