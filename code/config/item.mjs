import * as advancement from "../documents/advancement/_module.mjs";
import { preLocalize } from "./utils.mjs";


/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Advancement                              */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Advancement types that can be added to items.
 * @enum {typeof Advancement}
 */
export const advancementTypes = {
	ASI: advancement.ASIAdvancement,
	Defense: advancement.DefenseAdvancement,
	HitPoints: advancement.HitPointsAdvancement,
	ItemGrant: advancement.ItemGrantAdvancement,
	Resource: advancement.ResourceAdvancement,
	ScaleValue: advancement.ScaleValueAdvancement,
	Trait: advancement.TraitAdvancement
};

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Consumption & Uses                       */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Types of consumption targets that can be defined.
 * @enum {LabeledConfiguration}
 */
export const consumptionTypes = {
	resource: {
		label: "EH.Resource.Label[one]"
	}
	// TODO: Add support for more consumption types like hit dice
};
preLocalize("consumptionTypes", { key: "label" });

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * At what point are an item's resources recovered?
 * @enum {LabeledConfiguration}
 */
export const recoveryPeriods = {
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
/*  Items                                    */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Configuration data for item categories.
 *
 * @typedef {LabeledConfiguration} ItemCategoryConfiguration
 * @property {string[]} types - Types of items that will appear in this category and use its sheet.
 */

/**
 * Broad item categories and which types belong within them.
 * @enum {ItemCategoryConfiguration}
 */
export const itemCategories = {
	concept: {
		label: "EH.Item.Category.Concept.Label",
		types: ["archetype", "class", "background", "profession"]
	},
	feature: {
		label: "EH.Item.Category.Feature.Label",
		types: ["talent", "specialFeature", "plan", "trick", "feat", "npcFeature"]
	},
	physical: {
		label: "EH.Item.Category.Physical.Label",
		types: ["armor", "weapon", "ammunition", "explosive", "gear", "npcWeapon"]
	}
};
preLocalize("itemCategories", { key: "label" });

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
 * @typedef {LabeledConfiguration} EquipmentCategoryConfiguration
 * @property {string} [hint] - Localized hint.
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
		hint: ""
	},
	awkward: {
		label: "EH.Armor.Property.Awkward.Label",
		hint: ""
	},
	ballistic: {
		label: "EH.Armor.Property.Ballistic.Label",
		hint: ""
	},
	belt: {
		label: "EH.Weapon.Property.Belt.Label",
		hint: ""
	},
	blinding: {
		label: "EH.Weapon.Property.Blinding.Label",
		hint: "",
		condition: "blinded"
	},
	burst: {
		label: "EH.Weapon.Property.Burst.Label",
		hint: ""
	},
	concealable: {
		label: "EH.Armor.Property.Concealable.Label",
		hint: ""
	},
	deafening: {
		label: "EH.Weapon.Property.Deafening.Label",
		hint: "",
		condition: "deafened"
	},
	disguised: {
		label: "EH.Weapon.Property.Disguised.Label",
		hint: ""
	},
	finesse: {
		label: "EH.Weapon.Property.Finesse.Label",
		hint: "",
		restriction: {"system.type.value": "melee"}
	},
	fullAuto: {
		label: "EH.Weapon.Property.FullAuto.Label",
		hint: ""
	},
	grenade: {
		label: "EH.Weapon.Property.Grenade.Label",
		hint: ""
	},
	heavy: {
		label: "EH.Weapon.Property.Heavy.Label",
		hint: ""
	},
	illuminating: {
		label: "EH.Weapon.Property.Illuminating.Label",
		hint: ""
	},
	improvised: {
		label: "EH.Weapon.Property.Improvised.Label",
		hint: ""
	},
	indirect: {
		label: "EH.Weapon.Property.Indirect.Label",
		hint: ""
	},
	light: {
		label: "EH.Weapon.Property.Light.Label",
		hint: ""
	},
	loud: {
		label: "EH.Weapon.Property.Loud.Label",
		hint: ""
	},
	reach: {
		label: "EH.Weapon.Property.Reach.Label",
		hint: "",
		restriction: {"system.type.value": "melee"}
	},
	restricted: {
		label: "EH.Weapon.Property.Restricted.Label",
		hint: ""
	},
	returning: {
		label: "EH.Weapon.Property.Returning.Label",
		hint: ""
	},
	semiAuto: {
		label: "EH.Weapon.Property.SemiAuto.Label",
		hint: ""
	},
	shot: {
		label: "EH.Weapon.Property.Shot.Label",
		hint: ""
	},
	slowFiring: {
		label: "EH.Weapon.Property.SlowFiring.Label",
		hint: ""
	},
	small: {
		label: "EH.Armor.Property.Small.Label",
		hint: ""
	},
	special: {
		label: "EH.Weapon.Property.Special.Label",
		hint: ""
	},
	stabProof: {
		label: "EH.Armor.Property.StabProof.Label",
		hint: ""
	},
	stationary: {
		label: "EH.Weapon.Property.Stationary.Label",
		hint: ""
	},
	stunning: {
		label: "EH.Weapon.Property.Stunning.Label",
		hint: "",
		condition: "stunned"
	},
	thrown: {
		label: "EH.Weapon.Property.Thrown.Label",
		hint: ""
	},
	twoHanded: {
		label: "EH.Weapon.Property.TwoHanded.Label",
		hint: ""
	},
	unreliable: {
		label: "EH.Weapon.Property.Unreliable.Label",
		hint: ""
	},
	versatile: {
		label: "EH.Weapon.Property.Versatile.Label",
		hint: ""
	}
};
preLocalize("equipmentProperties", { key: "label", sort: true });

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Properties that can be applied to various item types.
 * @enum {string[]}
 */
export const applicableProperties = {
	armor: [
		"awkward", "ballistic", "concealable", "small", "stabProof"
	],
	explosive: [
		"blinding", "deafening", "disguised", "grenade", "heavy", "illuminating", "improvised", "indirect", "loud", "restricted",
		"special", "stunning", "thrown", "unreliable"
	],
	weapon: [
		"aquatic", "belt", "blinding", "burst", "deafening", "disguised", "finesse", "fullAuto", "grenade", "heavy",
		"improvised", "indirect", "light", "loud", "reach", "restricted", "returning", "semiAuto", "shot",
		"slowFiring", "special", "stationary", "stunning", "thrown", "twoHanded", "unreliable", "versatile"
	]
};
applicableProperties.ammunition = applicableProperties.weapon;
applicableProperties.npcWeapon = applicableProperties.weapon;

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
	}
};
preLocalize("explosiveTypes", { key: "label" });

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Feats                                    */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * General feat categories.
 * @enum {LabeledConfiguration}
 */
export const featCategories = {
	basic: {
		label: "EH.Feat.Category.Basic.Label"
	},
	advanced: {
		label: "EH.Feat.Category.Advanced.Label"
	},
	multiclass: {
		label: "EH.Feat.Category.Multiclass.Label"
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
 * @property {string} npcHint - Extra text that will be displayed on NPC sheets.
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
