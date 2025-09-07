/**
 * Extended version of `CombatTracker` class to support the initiative dialog.
 */
export default class CombatTrackerEH extends foundry.applications.sidebar.tabs.CombatTracker {
	async _onCombatantControl(event, target) {
		const combatantId = target.closest("[data-combatant-id]").dataset.combatantId;
		const combatant = this.viewed.combatants.get(combatantId);
		const action = target.dataset.control || target.dataset.action;
		if (action === "rollInitiative" && combatant?.actor) {
			return combatant.actor.configureInitiativeRoll({ event });
		}
		return super._onCombatantControl(event);
	}
}
