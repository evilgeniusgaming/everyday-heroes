import * as advancement from "../documents/advancement/_module.mjs";
import { preLocalize } from "./utils.mjs";

/**
 * Advancement types that can be added to items.
 * @enum {typeof Advancement}
 */
export const advancementTypes = {
	HitPoints: advancement.HitPointsAdvancement
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
		label: "EH.Equipment.Cateogry.Basic.Label"
	},
	advanced: {
		label: "EH.Equipment.Cateogry.Advanced.Label",
		requires: "basic"
	},
	historical: {
		label: "EH.Equipment.Cateogry.Historical.Label",
		requires: "basic"
	},
	improvised: {
		label: "EH.Equipment.Cateogry.Improvised.Label",
		requires: "basic"
	},
	military: {
		label: "EH.Equipment.Cateogry.Military.Label",
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
		hint: ""
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
		hint: ""
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
