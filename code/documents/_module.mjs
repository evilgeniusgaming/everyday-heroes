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
	CONFIG.Item.typeIcons = {
		// Concept
		archetype: "fa-solid fa-landmark",
		background: "fa-solid fa-address-card",
		class: "fa-solid fa-landmark-flag",
		profession: "fa-solid fa-user-tie",

		// Features
		talent: "fa-solid fa-users-rectangle",
		specialFeature: "fa-solid fa-users-rectangle",
		plan: "fa-solid fa-ruler",
		trick: "fa-solid fa-ruler",
		feat: "fa-solid fa-house-user",
		npcFeature: "fa-solid fa-otter",

		// Physical
		ammunition: "fa-solid fa-cubes-stacked",
		armor: "fa-solid fa-shield-halved",
		weapon: "fa-solid fa-gun",
		explosive: "fa-solid fa-burst",
		gear: "fa-solid fa-bag-shopping"
	};
	CONFIG.Item.typeImages = {
		ammunition: "systems/everyday-heroes/artwork/svg/items/ammunition.svg",
		armor: "systems/everyday-heroes/artwork/svg/items/armor.svg",
		weapon: "systems/everyday-heroes/artwork/svg/items/weapon.svg",
		explosive: "systems/everyday-heroes/artwork/svg/items/explosive.svg",
		gear: "systems/everyday-heroes/artwork/svg/items/gear.svg"
	};
	CONFIG.Item.typeLabels = {
		// Concept
		archetype: "EH.Item.Type.Archetype[one]",
		background: "EH.Item.Type.Background[one]",
		class: "EH.Item.Type.Class[one]",
		profession: "EH.Item.Type.Profession[one]",

		// Features
		talent: "EH.Item.Type.Talent[one]",
		specialFeature: "EH.Item.Type.SpecialFeature[one]",
		plan: "EH.Item.Type.Plan[one]",
		trick: "EH.Item.Type.Trick[one]",
		feat: "EH.Item.Type.Feat[one]",
		npcFeature: "EH.Item.Type.NPCFeature[one]",

		// Physical
		ammunition: "EH.Item.Type.Ammunition[one]",
		armor: "EH.Item.Type.Armor[one]",
		weapon: "EH.Item.Type.Weapon[one]",
		explosive: "EH.Item.Type.Explosive[one]",
		gear: "EH.Item.Type.Gear[one]"
	};
	CONFIG.Item.typeLabelsPlural = {
		// Concept
		archetype: "EH.Item.Type.Archetype[other]",
		background: "EH.Item.Type.Background[other]",
		class: "EH.Item.Type.Class[other]",
		profession: "EH.Item.Type.Profession[other]",

		// Features
		talent: "EH.Item.Type.Talent[other]",
		specialFeature: "EH.Item.Type.SpecialFeature[other]",
		plan: "EH.Item.Type.Plan[other]",
		trick: "EH.Item.Type.Trick[other]",
		feat: "EH.Item.Type.Feat[other]",
		npcFeature: "EH.Item.Type.NPCFeature[other]",

		// Physical
		ammunition: "EH.Item.Type.Ammunition[other]",
		armor: "EH.Item.Type.Armor[other]",
		weapon: "EH.Item.Type.Weapon[other]",
		explosive: "EH.Item.Type.Explosive[other]",
		gear: "EH.Item.Type.Gear[other]"
	};
}

export {ActiveEffectEH, ActorEH, ChatMessageEH, CombatantEH, ItemEH};
export * as advancement from "./advancement/_module.mjs";
export {default as Proficiency} from "./proficiency.mjs";
