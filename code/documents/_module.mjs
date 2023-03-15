import ActorEH from "./actor.mjs";
import CombatantEH from "./combatant.mjs";
import ItemEH from "./item.mjs";

/**
 * Register the various documents & type labels provided by Everyday Heroes during initialization.
 */
export function registerDocumentClasses() {
	CONFIG.Actor.documentClass = ActorEH;
	CONFIG.Actor.typeLabels = {
		hero: "EH.Actor.Type.Hero[one]",
		npc: "EH.Actor.Type.NPC[one]"
	};
	CONFIG.Combatant.documentClass = CombatantEH;
	CONFIG.Item.documentClass = ItemEH;
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

		// Equipment
		ammunition: "EH.Item.Type.Ammunition[one]",
		armor: "EH.Item.Type.Armor[one]",
		weapon: "EH.Item.Type.Weapon[one]",
		explosive: "EH.Item.Type.Explosive[one]",
		gear: "EH.Item.Type.Gear[one]"
	};
}

export {ActorEH, CombatantEH, ItemEH};
export * as advancement from "./advancement/_module.mjs";
export {default as Proficiency} from "./proficiency.mjs";
