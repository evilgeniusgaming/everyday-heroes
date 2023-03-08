import * as advancement from "../documents/advancement/_module.mjs";
import { preLocalize } from "./utils.mjs";

/**
 * Advancement types that can be added to items.
 * @enum {typeof Advancement}
 */
export const advancementTypes = {
	HitPoints: advancement.HitPointsAdvancement,
	ItemGrant: advancement.ItemGrantAdvancement
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
		label: "EH.Weapon.Properties.Aquatic.Label",
		hint: ""
	},
	awkward: {
		label: "EH.Armor.Properties.Awkward.Label",
		hint: ""
	},
	ballistic: {
		label: "EH.Armor.Properties.Ballistic.Label",
		hint: ""
	},
	belt: {
		label: "EH.Weapon.Properties.Belt.Label",
		hint: ""
	},
	blinding: {
		label: "EH.Weapon.Properties.Blinding.Label",
		hint: ""
	},
	burst: {
		label: "EH.Weapon.Properties.Burst.Label",
		hint: ""
	},
	concealable: {
		label: "EH.Armor.Properties.Concealable.Label",
		hint: ""
	},
	deafening: {
		label: "EH.Weapon.Properties.Deafening.Label",
		hint: ""
	},
	disguised: {
		label: "EH.Weapon.Properties.Disguised.Label",
		hint: ""
	},
	finesse: {
		label: "EH.Weapon.Properties.Finesse.Label",
		hint: "",
		condition: {"system.type.value": "melee"}
	},
	fullAuto: {
		label: "EH.Weapon.Properties.FullAuto.Label",
		hint: ""
	},
	grenade: {
		label: "EH.Weapon.Properties.Grenade.Label",
		hint: ""
	},
	heavy: {
		label: "EH.Weapon.Properties.Heavy.Label",
		hint: ""
	},
	illuminating: {
		label: "EH.Weapon.Properties.Illuminating.Label",
		hint: ""
	},
	improvised: {
		label: "EH.Weapon.Properties.Improvised.Label",
		hint: ""
	},
	indirect: {
		label: "EH.Weapon.Properties.Indirect.Label",
		hint: ""
	},
	light: {
		label: "EH.Weapon.Properties.Light.Label",
		hint: ""
	},
	loud: {
		label: "EH.Weapon.Properties.Loud.Label",
		hint: ""
	},
	reach: {
		label: "EH.Weapon.Properties.Reach.Label",
		hint: "",
		condition: {"system.type.value": "melee"}
	},
	restricted: {
		label: "EH.Weapon.Properties.Restricted.Label",
		hint: ""
	},
	returning: {
		label: "EH.Weapon.Properties.Returning.Label",
		hint: ""
	},
	semiAuto: {
		label: "EH.Weapon.Properties.SemiAuto.Label",
		hint: ""
	},
	shot: {
		label: "EH.Weapon.Properties.Shot.Label",
		hint: ""
	},
	slowFiring: {
		label: "EH.Weapon.Properties.SlowFiring.Label",
		hint: ""
	},
	small: {
		label: "EH.Armor.Properties.Small.Label",
		hint: ""
	},
	special: {
		label: "EH.Weapon.Properties.Special.Label",
		hint: ""
	},
	stabProof: {
		label: "EH.Armor.Properties.StabProof.Label",
		hint: ""
	},
	stationary: {
		label: "EH.Weapon.Properties.Stationary.Label",
		hint: ""
	},
	stunning: {
		label: "EH.Weapon.Properties.Stunning.Label",
		hint: ""
	},
	thrown: {
		label: "EH.Weapon.Properties.Thrown.Label",
		hint: ""
	},
	twoHanded: {
		label: "EH.Weapon.Properties.TwoHanded.Label",
		hint: ""
	},
	unreliable: {
		label: "EH.Weapon.Properties.Unreliable.Label",
		hint: ""
	},
	versatile: {
		label: "EH.Weapon.Properties.Versatile.Label",
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
	pistol: "EH.Ammunition.Types.Pistol.Label",
	rifle: "EH.Ammunition.Types.Rifle.Label",
	shotgun: "EH.Ammunition.Types.Shotgun.Label",
	machineGun: "EH.Ammunition.Types.MachineGun.Label"
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
	armor: "EH.Armor.Types.Armor.Label",
	shield: "EH.Armor.Types.Shield.Label"
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
	grenade: "EH.Explosive.Types.Grenade.Label",
	rocket: "EH.Explosive.Types.Rocket.Label",
	mine: "EH.Explosive.Types.Mine.Label"
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
	everydayStuff: "EH.Gear.Types.EverydayStuff.Label",
	equipmentPack: "EH.Gear.Types.EquipmentPack.Label",
	specializedKit: "EH.Gear.Types.SpecializedKit.Label",
	firearmAccessory: "EH.Gear.Types.FirearmAccessory.Label",
	carryingCase: "EH.Gear.Types.CarryingCase.Label",
	electronics: "EH.Gear.Types.Electronics.Label",
	hardware: "EH.Gear.Types.Hardware.Label",
	specialtyGoods: "EH.Gear.Types.SpecialtyGoods.Label",
	sportingGoods: "EH.Gear.Types.SportingGoods.Label"
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
	melee: "EH.Weapon.Types.Melee.Label",
	ranged: "EH.Weapon.Types.Ranged.Label"
};
preLocalize("weaponTypes");
