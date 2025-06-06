import { filterObject } from "../utils.mjs";

/**
 * Patch TokenHUD to limit status effect choices by actor type.
 */
export default function patchTokenHUD() {
	const original = foundry.applications.hud.TokenHUD.prototype._getStatusEffectChoices;
	foundry.applications.hud.TokenHUD.prototype._getStatusEffectChoices = function() {
		const choices = original.bind(this)();
		const actorType = this.object.document.actor?.type;
		const applicableConditions = CONFIG.EverydayHeroes.applicableConditions[actorType] ?? [];
		return filterObject(choices, c =>
			applicableConditions.includes(c.id) || CONFIG.EverydayHeroes.retainedStatusEffects.includes(c.id)
		);
	};
}
