import ActiveEffectEH from "./active-effect.mjs";
import ActorEH from "./actor.mjs";
import ChatMessageEH from "./chat-message.mjs";
import CombatEH from "./combat.mjs";
import CombatantEH from "./combatant.mjs";
import ItemEH from "./item.mjs";
import TokenDocumentEH from "./token.mjs";

/**
 * Register the various documents & type labels provided by Everyday Heroes during initialization.
 */
export function registerDocumentClasses() {
	CONFIG.ActiveEffect.documentClass = ActiveEffectEH;
	CONFIG.Actor.documentClass = ActorEH;
	CONFIG.ChatMessage.documentClass = ChatMessageEH;
	CONFIG.Combat.documentClass = CombatEH;
	CONFIG.Combatant.documentClass = CombatantEH;
	CONFIG.Item.documentClass = ItemEH;
	CONFIG.Token.documentClass = TokenDocumentEH;
}

export {ActiveEffectEH, ActorEH, ChatMessageEH, CombatEH, CombatantEH, ItemEH, TokenDocumentEH};
export * as advancement from "./advancement/_module.mjs";
export {default as Proficiency} from "./proficiency.mjs";
