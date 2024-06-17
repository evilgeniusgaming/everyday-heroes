import { filterObject } from "../utils.mjs";
import * as advancement from "../documents/advancement/_module.mjs";
import * as itemSheet from "../applications/item/_module.mjs";
import { preLocalize } from "./utils.mjs";


/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Advancement                              */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Configuration data for advancement types.
 *
 * @typedef {object} AdvancementTypeConfig
 * @property {typeof Advancement} type - Advancement type represented.
 * @property {Set<string>} validItemTypes - Types to which this advancement can be added.
 */

/**
 * Advancement types that can be added to items.
 * @enum {AdvancementTypeConfig}
 */
export const advancementTypes = {
	ASI: {
		type: advancement.ASIAdvancement,
		validItemTypes: new Set(["background", "profession", "feat"])
	},
	Defense: {
		type: advancement.DefenseAdvancement,
		validItemTypes: new Set(["archetype"])
	},
	HitPoints: {
		type: advancement.HitPointsAdvancement,
		validItemTypes: new Set(["archetype"])
	},
	ItemGrant: {
		type: advancement.ItemGrantAdvancement,
		validItemTypes: new Set(["archetype", "class", "background", "profession"])
	},
	Resource: {
		type: advancement.ResourceAdvancement,
		validItemTypes: new Set(["archetype", "class", "background", "profession", "feat"])
	},
	ScaleValue: {
		type: advancement.ScaleValueAdvancement,
		validItemTypes: new Set(["archetype", "class", "background", "profession", "feat"])
	},
	Trait: {
		type: advancement.TraitAdvancement,
		validItemTypes: new Set(["background", "profession", "class", "feat"])
	}
};

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Modes used within a trait advancement.
 * @enum {HintedConfiguration}
 */
export const traitModes = {
	default: {
		label: "EH.Advancement.Trait.Mode.Default.Label",
		hint: "EH.Advancement.Trait.Mode.Default.Hint"
	},
	expertise: {
		label: "EH.Advancement.Trait.Mode.Expertise.Label",
		hint: "EH.Advancement.Trait.Mode.Expertise.Hint"
	},
	upgrade: {
		label: "EH.Advancement.Trait.Mode.Upgrade.Label",
		hint: "EH.Advancement.Trait.Mode.Upgrade.Hint"
	}
};

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Consumption & Uses                       */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Configuration data for item consumption.
 *
 * @typedef {LabeledConfiguration} ConsumptionConfiguration
 * @property {boolean} [target=true] - Does this consumption require an additional "Target" field?
 */

/**
 * Types of consumption targets that can be defined.
 * @enum {ConsumptionConfiguration}
 */
export const consumptionTypes = {
	resource: {
		label: "EH.Resource.Label[one]"
	},
	hitDice: {
		label: "EH.HitDice.Label[other]",
		target: false
	},
	uses: {
		label: "EH.Uses.Label"
	}
};
preLocalize("consumptionTypes", { key: "label" });

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * How does the resource value change during its recovery period?
 * @enum {HintedConfiguration}
 */
export const recoveryModes = {
	recover: {
		label: "EH.Uses.Recovery.Mode.Recover.Label",
		hint: "EH.Uses.Recovery.Mode.Recover.Hint"
	},
	reset: {
		label: "EH.Uses.Recovery.Mode.Reset.Label",
		hint: "EH.Uses.Recovery.Mode.Reset.Hint"
	}
};
preLocalize("recoveryModes", { keys: ["label", "hint"] });

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Configuration data for item usage recovery periods.
 *
 * @typedef {LabeledConfiguration} RecoveryPeriodConfiguration
 * @property {boolean} [combatOnly=false] - Is this period only consumed during a combat encounter?
 */

/**
 * At what point are an item's resources recovered?
 * @enum {RecoveryPeriodConfiguration}
 */
export const recoveryPeriods = {
	turn: {
		label: "EH.Uses.Recovery.Period.Turn.Label",
		abbreviation: "EH.Uses.Recovery.Period.Turn.Label",
		combatOnly: true
	},
	round: {
		label: "EH.Uses.Recovery.Period.Round.Label",
		abbreviation: "EH.Uses.Recovery.Period.Round.Label",
		combatOnly: true
	},
	encounter: {
		label: "EH.Uses.Recovery.Period.Encounter.Label",
		abbreviation: "EH.Uses.Recovery.Period.Encounter.Label",
		combatOnly: true
	},
	sr: {
		label: "EH.Rest.Type.Short.Label",
		abbreviation: "EH.Rest.Type.Short.Abbreviation"
	},
	lr: {
		label: "EH.Rest.Type.Long.Label",
		abbreviation: "EH.Rest.Type.Long.Abbreviation"
	}
};
preLocalize("recoveryPeriods", { keys: ["label", "abbreviation"] });

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Subset of recovery periods that are recoverable outside of combat.
 * @returns {Object<RecoveryPeriodConfiguration>}
 */
export const resourceRecoveryPeriods = filterObject(recoveryPeriods, p => !p.combatOnly);

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Items                                    */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Broad item categories and which types belong within them.
 * @enum {CategoryConfiguration}
 */
export const itemCategories = {
	concept: {
		label: "EH.Item.Category.Concept.Label",
		types: ["archetype", "class", "background", "profession"],
		sheet: {
			application: itemSheet.ConceptSheet,
			label: "EH.Sheet.Concept"
		}
	},
	feature: {
		label: "EH.Item.Category.Feature.Label",
		types: ["talent", "specialFeature", "plan", "trick", "feat", "npcFeature"],
		sheet: {
			application: itemSheet.FeatureSheet,
			label: "EH.Sheet.Feature"
		}
	},
	physical: {
		label: "EH.Item.Category.Physical.Label",
		types: [
			"armor", "weapon", "ammunition", "explosive", "gear", "clothes", "npcWeapon", "npcExplosive",
			"vehicleModification", "vehicleWeapon"
		],
		sheet: {
			application: itemSheet.PhysicalSheet,
			label: "EH.Sheet.Physical"
		}
	},
	meta: {
		label: "EH.Item.Category.Meta.Label",
		types: ["condition"]
	}
};
preLocalize("itemCategories", { key: "label" });

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Different versions of certain items depending on what actor type they are embedded within.
 * @enum {object}
 */
export const itemVariants = {
	explosive: {
		npc: "npcExplosive"
	},
	weapon: {
		npc: "npcWeapon",
		vehicle: "vehicleWeapon"
	}
};

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Equipment                                */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Configuration data for equipment categories.
 *
 * @typedef {LabeledConfiguration} EquipmentCategoryConfiguration
 * @property {string} [requires] - Key of another category that the player must be proficient in to gain
 *                                 proficiency in this category.
 */

/**
 * Set of Equipment Categories that can be selected & player can gain proficiency in.
 * @enum {EquipmentCategoryConfiguration}
 */
export const equipmentCategories = {
	basic: {
		label: "EH.Equipment.Category.Basic.Label"
	},
	advanced: {
		label: "EH.Equipment.Category.Advanced.Label",
		requires: "basic"
	},
	historical: {
		label: "EH.Equipment.Category.Historical.Label",
		requires: "basic"
	},
	improvised: {
		label: "EH.Equipment.Category.Improvised.Label",
		requires: "basic"
	},
	military: {
		label: "EH.Equipment.Category.Military.Label",
		requires: "advanced"
	}
};
preLocalize("equipmentCategories", { key: "label" });

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Configuration data for equipment categories.
 *
 * @typedef {LabeledConfiguration} EquipmentPropertyConfiguration
 * @property {string} [hint] - Localized hint.
 * @property {string} [npcHint] - Hint that is displayed on an NPC sheet.
 * @property {string} [condition] - Condition that is imposed on people affected by this equipment if they
 *                                  fail a constitution saving throw against the attackers dexterity DC.
 */

/**
 * Set of Properties that can be applied to various types of equipment.
 * @enum {EquipmentPropertyConfiguration}
 */
export const equipmentProperties = {
	aquatic: {
		label: "EH.Weapon.Property.Aquatic.Label",
		hint: "EH.Weapon.Property.Aquatic.Hint",
		npcHint: "EH.Weapon.Property.Aquatic.NPCHint"
	},
	awkward: {
		label: "EH.Armor.Property.Awkward.Label",
		hint: "EH.Armor.Property.Awkward.Hint"
	},
	ballistic: {
		label: "EH.Armor.Property.Ballistic.Label",
		hint: "EH.Armor.Property.Ballistic.Hint"
	},
	belt: {
		label: "EH.Weapon.Property.Belt.Label",
		hint: "EH.Weapon.Property.Belt.Hint"
	},
	blinding: {
		label: "EH.Weapon.Property.Blinding.Label",
		hint: "EH.Weapon.Property.Blinding.Hint",
		condition: "blinded"
	},
	burst: {
		label: "EH.Weapon.Property.Burst.Label",
		hint: "EH.Weapon.Property.Burst.Hint"
	},
	concealable: {
		label: "EH.Armor.Property.Concealable.Label",
		hint: "EH.Armor.Property.Concealable.Hint"
	},
	deafening: {
		label: "EH.Weapon.Property.Deafening.Label",
		hint: "EH.Weapon.Property.Deafening.Hint",
		condition: "deafened"
	},
	disguised: {
		label: "EH.Weapon.Property.Disguised.Label",
		hint: "EH.Weapon.Property.Disguised.Hint"
	},
	finesse: {
		label: "EH.Weapon.Property.Finesse.Label",
		hint: "EH.Weapon.Property.Finesse.Hint",
		restriction: {"system.type.value": "melee"}
	},
	fullAuto: {
		label: "EH.Weapon.Property.FullAuto.Label",
		hint: "EH.Weapon.Property.FullAuto.Hint"
	},
	grenade: {
		label: "EH.Weapon.Property.Grenade.Label",
		hint: "EH.Weapon.Property.Grenade.Hint"
	},
	heavy: {
		label: "EH.Weapon.Property.Heavy.Label",
		hint: "EH.Weapon.Property.Heavy.Hint"
	},
	illuminating: {
		label: "EH.Weapon.Property.Illuminating.Label",
		hint: "EH.Weapon.Property.Illuminating.Hint"
	},
	improvised: {
		label: "EH.Weapon.Property.Improvised.Label",
		hint: "EH.Weapon.Property.Improvised.Hint"
	},
	indirect: {
		label: "EH.Weapon.Property.Indirect.Label",
		hint: "EH.Weapon.Property.Indirect.Hint"
	},
	light: {
		label: "EH.Weapon.Property.Light.Label",
		hint: "EH.Weapon.Property.Light.Hint"
	},
	loud: {
		label: "EH.Weapon.Property.Loud.Label",
		hint: "EH.Weapon.Property.Loud.Hint"
	},
	reach: {
		label: "EH.Weapon.Property.Reach.Label",
		hint: "EH.Weapon.Property.Reach.Hint",
		restriction: {"system.type.value": "melee"}
	},
	restricted: {
		label: "EH.Weapon.Property.Restricted.Label",
		hint: "EH.Weapon.Property.Restricted.Hint"
	},
	returning: {
		label: "EH.Weapon.Property.Returning.Label",
		hint: "EH.Weapon.Property.Returning.Hint"
	},
	semiAuto: {
		label: "EH.Weapon.Property.SemiAuto.Label",
		hint: "EH.Weapon.Property.SemiAuto.Hint"
	},
	shot: {
		label: "EH.Weapon.Property.Shot.Label",
		hint: "EH.Weapon.Property.Shot.Hint",
		npcHint: "EH.Weapon.Property.Shot.NPCHint"
	},
	slowFiring: {
		label: "EH.Weapon.Property.SlowFiring.Label",
		hint: "EH.Weapon.Property.SlowFiring.Hint"
	},
	small: {
		label: "EH.Armor.Property.Small.Label",
		hint: "EH.Armor.Property.Small.Hint"
	},
	special: {
		label: "EH.Weapon.Property.Special.Label",
		hint: "EH.Weapon.Property.Special.Hint"
	},
	stabProof: {
		label: "EH.Armor.Property.StabProof.Label",
		hint: "EH.Armor.Property.StabProof.Hint"
	},
	stationary: {
		label: "EH.Weapon.Property.Stationary.Label",
		hint: "EH.Weapon.Property.Stationary.Hint"
	},
	stunning: {
		label: "EH.Weapon.Property.Stunning.Label",
		hint: "EH.Weapon.Property.Stunning.Hint",
		condition: "stunned"
	},
	swarm: {
		label: "EH.Weapon.Property.Swarm.Label",
		hint: "EH.Weapon.Property.Swarm.Hint"
	},
	thrown: {
		label: "EH.Weapon.Property.Thrown.Label",
		hint: "EH.Weapon.Property.Thrown.Hint"
	},
	twoHanded: {
		label: "EH.Weapon.Property.TwoHanded.Label",
		hint: "EH.Weapon.Property.TwoHanded.Hint"
	},
	unreliable: {
		label: "EH.Weapon.Property.Unreliable.Label",
		hint: "EH.Weapon.Property.Unreliable.Hint"
	},
	versatile: {
		label: "EH.Weapon.Property.Versatile.Label",
		hint: "EH.Weapon.Property.Versatile.Hint"
	}
};
preLocalize("equipmentProperties", { keys: ["label", "npcHint"], sort: true });

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Properties that can be applied to various item types.
 * @enum {string[]}
 */
export const applicableProperties = {
	armor: [
		"awkward", "ballistic", "concealable", "restricted", "small", "stabProof"
	],
	explosive: [
		"blinding", "deafening", "disguised", "grenade", "heavy", "illuminating", "improvised", "indirect", "loud", "restricted",
		"special", "stunning", "thrown", "unreliable"
	],
	vehicleModification: [
		"special"
	],
	weapon: [
		"aquatic", "belt", "blinding", "burst", "deafening", "disguised", "finesse", "fullAuto", "grenade", "heavy",
		"improvised", "indirect", "light", "loud", "reach", "restricted", "returning", "semiAuto", "shot",
		"slowFiring", "special", "stationary", "stunning", "thrown", "twoHanded", "unreliable", "versatile"
	]
};
applicableProperties.ammunition = applicableProperties.weapon;
applicableProperties.npcExplosive = applicableProperties.explosive;
applicableProperties.npcWeapon = [...applicableProperties.weapon, "swarm"];
applicableProperties.vehicleWeapon = applicableProperties.weapon;

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Ammunition                               */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * General ammunition types.
 * @enum {string}
 */
export const ammunitionTypes = {
	pistol: {
		label: "EH.Ammunition.Type.Pistol.Label"
	},
	rifle: {
		label: "EH.Ammunition.Type.Rifle.Label"
	},
	shotgun: {
		label: "EH.Ammunition.Type.Shotgun.Label"
	},
	machineGun: {
		label: "EH.Ammunition.Type.MachineGun.Label"
	},
	cannon: {
		label: "EH.Ammunition.Type.Cannon.Label"
	}
};
preLocalize("ammunitionTypes", { key: "label" });

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Armor                                    */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * General armor types.
 * @enum {string}
 */
export const armorTypes = {
	armor: {
		label: "EH.Armor.Type.Armor.Label"
	},
	shield: {
		label: "EH.Armor.Type.Shield.Label"
	}
};
preLocalize("armorTypes", { key: "label" });

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Conditions                               */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * General condition types.
 * @enum {string}
 */
export const conditionTypes = {
	single: "EH.Condition.Type.Single",
	cumulative: "EH.Condition.Type.Cumulative"
};
preLocalize("conditionTypes");

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Explosive                                */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * General explosive types.
 * @enum {LabeledConfiguration}
 */
export const explosiveTypes = {
	grenade: {
		label: "EH.Explosive.Type.Grenade.Label"
	},
	rocket: {
		label: "EH.Explosive.Type.Rocket.Label"
	},
	mine: {
		label: "EH.Explosive.Type.Mine.Label"
	},
	mortar: {
		label: "EH.Explosive.Type.Mortar.Label"
	}
};
preLocalize("explosiveTypes", { key: "label" });

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Feats                                    */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Configuration information for feat categories.
 *
 * @typedef {LabeledConfiguration} FeatCategoryConfiguration
 * @property {string} [type] - Force feats in this category to have a specific type, otherwise it is can be chosen.
 */

/**
 * General feat categories.
 * @enum {FeatCategoryConfiguration}
 */
export const featCategories = {
	basic: {
		label: "EH.Feat.Category.Basic.Label",
		type: "minor"
	},
	advanced: {
		label: "EH.Feat.Category.Advanced.Label"
	},
	multiclass: {
		label: "EH.Feat.Category.Multiclass.Label",
		type: "major"
	}
};
preLocalize("featCategories", { key: "label" });

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * General feat types.
 * @enum {LabeledConfiguration}
 */
export const featTypes = {
	minor: {
		label: "EH.Feat.Type.Minor.Label"
	},
	major: {
		label: "EH.Feat.Type.Major.Label"
	}
};
preLocalize("featTypes", { key: "label" });

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Special Features                         */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * General special feature types.
 * @enum {LabeledConfiguration}
 */
export const specialFeatureTypes = {
	background: {
		label: "EH.Item.Type.Background[one]"
	},
	profession: {
		label: "EH.Item.Type.Profession[one]"
	}
};
preLocalize("specialFeatureTypes", { key: "label" });

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Talents                                  */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * General talent types.
 * @enum {LabeledConfiguration}
 */
export const talentTypes = {
	archetype: {
		label: "EH.Item.Type.Archetype[one]"
	},
	class: {
		label: "EH.Item.Type.Class[one]"
	}
};
preLocalize("talentTypes", { key: "label" });

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Gear                                     */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * General gear types.
 * @enum {LabeledConfiguration}
 */
export const gearTypes = {
	everydayStuff: {
		label: "EH.Gear.Type.EverydayStuff.Label"
	},
	equipmentPack: {
		label: "EH.Gear.Type.EquipmentPack.Label"
	},
	specializedKit: {
		label: "EH.Gear.Type.SpecializedKit.Label"
	},
	firearmAccessory: {
		label: "EH.Gear.Type.FirearmAccessory.Label"
	},
	carryingCase: {
		label: "EH.Gear.Type.CarryingCase.Label"
	},
	electronics: {
		label: "EH.Gear.Type.Electronics.Label"
	},
	hardware: {
		label: "EH.Gear.Type.Hardware.Label"
	},
	specialtyGoods: {
		label: "EH.Gear.Type.SpecialtyGoods.Label"
	},
	sportingGoods: {
		label: "EH.Gear.Type.SportingGoods.Label"
	}
};
preLocalize("gearTypes", { key: "label" });

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Weapons                                  */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Configuration data for weapon modes.
 *
 * @typedef {LabeledConfiguration} WeaponModeConfiguration
 * @property {string} [npcHint] - Extra text that will be displayed on NPC sheets.
 * @property {string} [icon] - Icon to use for all modes.
 * @property {object} [icons]
 * @property {string} [icons.melee] - Melee icon variant.
 * @property {string} [icons.ranged] - Ranged icon variant.
 * @property {ModeAvailabilityCallback} available - This method is called to check whether this mode is available for
 *                                                  the provided weapon.
 */

/**
	* @callback ModeAvailabilityCallback
	* @param {ItemEH} item - The weapon against which available should be checked.
	* @returns {boolean} - Should this mode be displayed for the provided weapon?
	*/

/**
 * Weapon modes that determine different attack or damage values.
 * @enum {WeaponModeConfiguration}
 */
export const weaponModes = {
	oneHanded: {
		label: "EH.Weapon.Mode.OneHanded.Label",
		icons: {
			melee: "systems/everyday-heroes/artwork/svg/action/attack-melee-one-handed.svg",
			ranged: "systems/everyday-heroes/artwork/svg/action/attack-ranged-one-handed.svg"
		},
		available: system => {
			if ( system.properties.has("versatile") ) return true;
			return !system.properties.has("twoHanded");
		}
	},
	twoHanded: {
		label: "EH.Weapon.Mode.TwoHanded.Label",
		npcHint: "EH.Weapon.Mode.TwoHanded.NPCHint",
		icons: {
			melee: "systems/everyday-heroes/artwork/svg/action/attack-melee-two-handed.svg",
			ranged: "systems/everyday-heroes/artwork/svg/action/attack-ranged-two-handed.svg"
		},
		available: system => {
			if ( system.properties.has("versatile") ) return true;
			return system.properties.has("twoHanded");
		}
	},
	offhand: {
		label: "EH.Weapon.Mode.Offhand.Label",
		icon: "systems/everyday-heroes/artwork/svg/action/attack-offhand.svg",
		available: system => system.properties.has("light")
	},
	thrown: {
		label: "EH.Weapon.Mode.Thrown.Label",
		icon: "systems/everyday-heroes/artwork/svg/action/attack-thrown.svg",
		available: system => (system.type.value === "melee") && system.properties.has("thrown")
	},
	burst: {
		label: "EH.Weapon.Mode.Burst.Label",
		npcHint: "EH.Weapon.Mode.Burst.NPCHint",
		icon: "systems/everyday-heroes/artwork/svg/action/attack-burst.svg",
		available: system => (system.type.value === "ranged") && system.properties.has("burst")
	},
	suppressiveFire: {
		label: "EH.Weapon.Mode.SuppressiveFire.Label",
		icon: "systems/everyday-heroes/artwork/svg/action/attack-suppressive-fire.svg",
		available: system => {
			if ( system.type.value !== "ranged" ) return false;
			return system.properties.has("fullAuto") || system.properties.has("semiAuto");
		}
	},
	swarm: {
		label: "EH.Weapon.Mode.Swarm.Label",
		npcHint: "EH.Weapon.Mode.Swarm.NPCHint",
		icon: "systems/everyday-heroes/artwork/svg/action/attack-swarm.svg",
		available: system => system.properties.has("swarm")
	}
};
preLocalize("weaponModes", { keys: ["label", "npcHint"] });

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Configuration data for suppressive fire action.
 *
 * @typedef {object} SuppressiveFireConfiguration
 * @property {number} rounds - How many rounds are expended with this weapon type?
 * @property {number} size - How wide is the field of fire with this weapon type?
 */

/**
 * Details on the suppressive fire mode.
 * @enum {SuppressiveFireConfiguration}
 */
export const weaponSuppressiveFire = {
	semiAuto: {
		rounds: 8,
		size: 10
	},
	fullAuto: {
		rounds: 8,
		size: 30
	}
};

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * General weapon types.
 * @enum {LabeledConfiguration}
 */
export const weaponTypes = {
	melee: {
		label: "EH.Weapon.Type.Melee.Label"
	},
	ranged: {
		label: "EH.Weapon.Type.Ranged.Label"
	}
};
preLocalize("weaponTypes", { key: "label" });

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Compendium Sections                      */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Sorting order for compendium sections.
 * @type {string[]}
 */
export const itemCompendiumSections = [
	"archetype", "class", "archetype-talent", "class-talent", "talent",
	"background", "background-special-feature",
	"profession", "profession-special-feature", "special-feature",
	"plan", "trick", "feat",
	"weapon", "armor", "shield", "ammunition", "explosive"
].concat(Object.keys(gearTypes));
