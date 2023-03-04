import AmmunitionData from "./ammunition-data.mjs";
import ArchetypeData from "./archetype-data.mjs";
import ArmorData from "./armor-data.mjs";
import BackgroundData from "./background-data.mjs";
import ClassData from "./class-data.mjs";
import ExplosiveData from "./explosive-data.mjs";
import GearData from "./gear-data.mjs";
import ProfessionData from "./profession-data.mjs";
import WeaponData from "./weapon-data.mjs";

export {
	AmmunitionData,
	ArchetypeData,
	ArmorData,
	BackgroundData,
	ClassData,
	ExplosiveData,
	GearData,
	ProfessionData,
	WeaponData
};
export {default as AdvancementTemplate} from "./templates/advancement-template.mjs";
export {default as DamageTemplate} from "./templates/damage-template.mjs";
export {default as DescribedTemplate} from "./templates/described-template.mjs";
export {default as PhysicalTemplate} from "./templates/physical-template.mjs";

export const config = {
	ammunition: AmmunitionData,
	archetype: ArchetypeData,
	armor: ArmorData,
	background: BackgroundData,
	class: ClassData,
	explosive: ExplosiveData,
	gear: GearData,
	profession: ProfessionData,
	weapon: WeaponData
};
