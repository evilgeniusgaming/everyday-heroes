/**
 * Extended version of `CombatTracker` class to support the initiative dialog.
 */
export default class CombatTrackerEH extends foundry.applications.sidebar.tabs.CombatTracker {
	async _onCombatantControl(event) {
		const combatantId = event.target.closest("[data-combatant-id]").dataset.combatantId;
		const combatant = this.viewed.combatants.get(combatantId);
		if ( event.currentTarget.dataset.control === "rollInitiative" && combatant?.actor ) {
			return combatant.actor.configureInitiativeRoll({ event });
		}
		return super._onCombatantControl(event);
	}
}
