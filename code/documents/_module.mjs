import ActiveEffectEH from "./active-effect.mjs";
import ActorEH from "./actor.mjs";
import ChatMessageEH from "./chat-message.mjs";
import CombatantEH from "./combatant.mjs";
import ItemEH from "./item.mjs";

/**
 * Register the various documents & type labels provided by Everyday Heroes during initialization.
 */
export function registerDocumentClasses() {
	CONFIG.ActiveEffect.documentClass = ActiveEffectEH;
	CONFIG.Actor.documentClass = ActorEH;
	CONFIG.Actor.typeLabels = {
		hero: "EH.Actor.Type.Hero[one]",
		npc: "EH.Actor.Type.NPC[one]"
	};
	CONFIG.ChatMessage.documentClass = ChatMessageEH;
	CONFIG.Combatant.documentClass = CombatantEH;
	CONFIG.Item.documentClass = ItemEH;
}

export {ActiveEffectEH, ActorEH, ChatMessageEH, CombatantEH, ItemEH};
export * as advancement from "./advancement/_module.mjs";
export {default as Proficiency} from "./proficiency.mjs";
