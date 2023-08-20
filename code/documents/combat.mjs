/**
 * Extended version of Combat with support for resource recovery.
 */
export default class CombatEH extends Combat {

	async startCombat() {
		await super.startCombat();
		// Reset all combat related uses at start of combat
		this._resetUses({encounter: true, round: true, turn: true}, {start: true});
		return this;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async nextTurn() {
		await super.nextTurn();
		// Reset per turn uses for all combatants & per round uses for the current combatant
		this._resetUses({round: this.combatant, turn: true});
		return this;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async endCombat() {
		await super.endCombat();
		// Reset all combat related uses when combat ends
		this._resetUses({encounter: true, round: true, turn: true});
		return this;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Reset combat specific uses for certain combatants.
	 * @param {object} types - Which types of recovery to handle, and whether they should be
	 *                         performed on all combatants or only the combatant specified.
	 * @param {boolean|CombatantEH} [types.encounter=false]
	 * @param {boolean|CombatantEH} [types.round=false]
	 * @param {boolean|CombatantEH} [types.turn=false]
	 * @param {object} [options={}]
	 * @param {boolean} [options.start=false] - Is this the beginning of an encounter?
	 */
	async _resetUses({encounter=false, round=false, turn=false}, {start=false}={}) {
		for ( const combatant of this.combatants ) {
			const types = [];
			if ( encounter === true || encounter === combatant ) types.push("encounter");
			if ( round === true || round === combatant ) types.push("round");
			if ( turn === true || turn === combatant ) types.push("turn");
			if ( types.length ) await combatant.resetCombatUses(types, { start });
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	// async rollInitiative(ids, {formula=null, updateTurn=true, messageOptions={}}={}) {
	// 	
	// }
}
