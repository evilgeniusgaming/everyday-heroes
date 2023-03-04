import ActorEH from "./actor.mjs";
import ItemEH from "./item.mjs";

/**
 * Register the various documents & type labels provided by Everyday Heroes during initialization.
 */
export function registerDocumentClasses() {
	CONFIG.Actor.documentClass = ActorEH;
	CONFIG.Actor.typeLabels = {
		hero: "EH.Actor.Types.Hero[one]",
		npc: "EH.Actor.Types.NPC[one]"
	};
	CONFIG.Item.documentClass = ItemEH;
	CONFIG.Item.typeLabels = {
		// Concept
		archetype: "EH.Item.Types.Archetype[one]",
		background: "EH.Item.Types.Background[one]",
		class: "EH.Item.Types.Class[one]",
		profession: "EH.Item.Types.Profession[one]",

		// Features
		talent: "EH.Item.Types.Talent[one]",
		specialfeature: "EH.Item.Types.SpecialFeature[one]",
		feat: "EH.Item.Types.Feat[one]",

		// Equipment
		ammunition: "EH.Item.Types.Ammunition[one]",
		armor: "EH.Item.Types.Armor[one]",
		weapon: "EH.Item.Types.Weapon[one]",
		explosive: "EH.Item.Types.Explosive[one]",
		gear: "EH.Item.Types.Gear[one]"
	};
}

export {ActorEH, ItemEH};
export * as advancement from "./advancement/_module.mjs";
export {default as Proficiency} from "./proficiency.mjs";
