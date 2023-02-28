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
		archetype: "EH.Item.Types.Archetype[one]",
		background: "EH.Item.Types.Background[one]",
		class: "EH.Item.Types.Class[one]",
		profession: "EH.Item.Types.Profession[one]",
		talent: "EH.Item.Types.Talent[one]",
		specialfeature: "EH.Item.Types.SpecialFeature[one]",
		feat: "EH.Item.Types.Feat[one]"
	};
}

export {ActorEH, ItemEH};
export * as advancement from "./advancement/_module.mjs";
export {default as Proficiency} from "./proficiency.mjs";
