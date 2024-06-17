import AmmunitionData from "./ammunition-data.mjs";
import ArchetypeData from "./archetype-data.mjs";
import ArmorData from "./armor-data.mjs";
import BackgroundData from "./background-data.mjs";
import ClothesData from "./clothes-data.mjs";
import ClassData from "./class-data.mjs";
import ConditionData from "./condition-data.mjs";
import ExplosiveData from "./explosive-data.mjs";
import FeatData from "./feat-data.mjs";
import GearData from "./gear-data.mjs";
import NPCExplosiveData from "./npc-explosive-data.mjs";
import NPCFeatureData from "./npc-feature-data.mjs";
import NPCWeaponData from "./npc-weapon-data.mjs";
import OriginData from "./origin-data.mjs";
import PlanData from "./plan-data.mjs";
import ProfessionData from "./profession-data.mjs";
import SpecialFeatureData from "./special-feature-data.mjs";
import TalentData from "./talent-data.mjs";
import TrickData from "./trick-data.mjs";
import VehicleModificationData from "./vehicle-modification-data.mjs";
import VehicleWeaponData from "./vehicle-weapon-data.mjs";
import WeaponData from "./weapon-data.mjs";

export {
	AmmunitionData,
	ArchetypeData,
	ArmorData,
	BackgroundData,
	ClothesData,
	ClassData,
	ConditionData,
	ExplosiveData,
	FeatData,
	GearData,
	NPCExplosiveData,
	NPCFeatureData,
	NPCWeaponData,
	OriginData,
	PlanData,
	ProfessionData,
	SpecialFeatureData,
	TalentData,
	TrickData,
	VehicleModificationData,
	VehicleWeaponData,
	WeaponData
};
export {default as ActivatableTemplate} from "./templates/activatable-template.mjs";
export {default as AdvancementTemplate} from "./templates/advancement-template.mjs";
export {default as AttackTemplate} from "./templates/attack-template.mjs";
export {default as BaseExplosiveTemplate} from "./templates/base-explosive-template.mjs";
export {default as BaseWeaponTemplate} from "./templates/base-weapon-template.mjs";
export {default as DamageTemplate} from "./templates/damage-template.mjs";
export {default as DescribedTemplate} from "./templates/described-template.mjs";
export {default as EquipmentTemplate} from "./templates/equipment-template.mjs";
export {default as PhysicalTemplate} from "./templates/physical-template.mjs";
export {default as TypedTemplate} from "./templates/typed-template.mjs";

export const config = {
	ammunition: AmmunitionData,
	archetype: ArchetypeData,
	armor: ArmorData,
	background: BackgroundData,
	clothes: ClothesData,
	class: ClassData,
	condition: ConditionData,
	explosive: ExplosiveData,
	feat: FeatData,
	gear: GearData,
	npcExplosive: NPCExplosiveData,
	npcFeature: NPCFeatureData,
	npcWeapon: NPCWeaponData,
	origin: OriginData,
	plan: PlanData,
	profession: ProfessionData,
	specialFeature: SpecialFeatureData,
	talent: TalentData,
	trick: TrickData,
	vehicleModification: VehicleModificationData,
	vehicleWeapon: VehicleWeaponData,
	weapon: WeaponData
};
