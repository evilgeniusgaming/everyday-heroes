import * as advancement from "../documents/advancement/_module.mjs";
import { preLocalize } from "./utils.mjs";

/**
 * Advancement types that can be added to items.
 * @enum {typeof Advancement}
 */
export const advancementTypes = {
	Defense: advancement.DefenseAdvancement,
	HitPoints: advancement.HitPointsAdvancement,
	ItemGrant: advancement.ItemGrantAdvancement,
	ScaleValue: advancement.ScaleValueAdvancement
};

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Configuration data for equipment categories.
 *
 * @typedef {object} EquipmentCategoryConfiguration
 * @property {string} label - Localized label.
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
 * @typedef {object} EquipmentCategoryConfiguration
 * @property {string} label - Localized label.
 * @property {string} [hint] - Localized hint.
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
		hint: ""
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
		hint: ""
	},
	disguised: {
		label: "EH.Weapon.Property.Disguised.Label",
		hint: ""
	},
	finesse: {
		label: "EH.Weapon.Property.Finesse.Label",
		hint: "",
		condition: {"system.type.value": "melee"}
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
		condition: {"system.type.value": "melee"}
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
		hint: ""
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
		"blinding", "deafening", "disguised", "grenade", "illuminating", "improvised", "indirect", "loud", "restricted",
		"special", "stunning", "thrown", "unreliable"
	],
	weapon: [
		"aquatic", "belt", "blinding", "burst", "deafening", "disguised", "finesse", "fullAuto", "grenade", "heavy",
		"improvised", "indirect", "light", "loud", "reach", "restricted", "returning", "semiAuto", "shot",
		"slowFiring", "special", "stationary", "stunning", "thrown", "twoHanded", "unreliable", "versatile"
	]
};

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Ammunition                               */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * General ammunition types.
 * @enum {string}
 */
export const ammunitionTypes = {
	pistol: "EH.Ammunition.Type.Pistol.Label",
	rifle: "EH.Ammunition.Type.Rifle.Label",
	shotgun: "EH.Ammunition.Type.Shotgun.Label",
	machineGun: "EH.Ammunition.Type.MachineGun.Label"
};
preLocalize("ammunitionTypes");

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Armor                                    */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * General armor types.
 * @enum {string}
 */
export const armorTypes = {
	armor: "EH.Armor.Type.Armor.Label",
	shield: "EH.Armor.Type.Shield.Label"
};
preLocalize("armorTypes");

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Explosive                                */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * General explosive types.
 * @enum {string}
 */
export const explosiveTypes = {
	grenade: "EH.Explosive.Type.Grenade.Label",
	rocket: "EH.Explosive.Type.Rocket.Label",
	mine: "EH.Explosive.Type.Mine.Label"
};
preLocalize("explosiveTypes");

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Gear                                     */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * General gear types.
 * @enum {string}
 */
export const gearTypes = {
	everydayStuff: "EH.Gear.Type.EverydayStuff.Label",
	equipmentPack: "EH.Gear.Type.EquipmentPack.Label",
	specializedKit: "EH.Gear.Type.SpecializedKit.Label",
	firearmAccessory: "EH.Gear.Type.FirearmAccessory.Label",
	carryingCase: "EH.Gear.Type.CarryingCase.Label",
	electronics: "EH.Gear.Type.Electronics.Label",
	hardware: "EH.Gear.Type.Hardware.Label",
	specialtyGoods: "EH.Gear.Type.SpecialtyGoods.Label",
	sportingGoods: "EH.Gear.Type.SportingGoods.Label"
};
preLocalize("gearTypes");

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Weapons                                  */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * General weapon types.
 * @enum {string}
 */
export const weaponTypes = {
	melee: "EH.Weapon.Type.Melee.Label",
	ranged: "EH.Weapon.Type.Ranged.Label"
};
preLocalize("weaponTypes");
