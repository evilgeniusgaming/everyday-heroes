import { preLocalize } from "./utils.mjs";

/**
 * Standard action types.
 * @enum {string}
 */
export const actionTypesStandard = {
	action: "EH.Action.Type.Action",
	bonus: "EH.Action.Type.Bonus",
	reaction: "EH.Action.Type.Reaction",
	attack: "EH.Action.Type.Attack"
};
preLocalize("actionTypesStandard");

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Action types that can be used when reloading a weapon.
 * 2
 */
export const actionTypesReload = {
	action: "EH.Action.Type.Action",
	bonus: "EH.Action.Type.Bonus",
	free: "EH.Action.Type.Free"
};
preLocalize("actionTypesReload");

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Damage types available in Everyday Heroes.
 * @enum {DamageTypeConfiguration}
 */
export const damageTypes = {
	acid: "EH.Damage.Type.Acid",
	ballistic: "EH.Damage.Type.Ballistic",
	bludgeoning: "EH.Damage.Type.Bludgeoning",
	cold: "EH.Damage.Type.Cold",
	electrical: "EH.Damage.Type.Electrical",
	explosive: "EH.Damage.Type.Explosive",
	fire: "EH.Damage.Type.Fire",
	piercing: "EH.Damage.Type.Piercing",
	poison: "EH.Damage.Type.Poison",
	psychic: "EH.Damage.Type.Psychic",
	slashing: "EH.Damage.Type.Slashing"
};
preLocalize("damageTypes", { sort: true });

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Progression of dice sizes used by Everyday Heroes.
 * @type {number[]}
 */
export const diceSteps = [4, 6, 8, 10, 12];

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 *
 *
 * @typedef {object} UnitConfiguration
 * @property {string} label - Localized label.
 * @property {string} abbreviation - Localized abbreviation.
 * @property {string} pluralPrefix - Prefix for the localization keys that represent plural forms of this unit. Will be
 *                                   appended with "[one]", "[few]", "[other]", etc. to match the plural forms of the
 *                                   current language.
 * @property {number} conversion - Number by which this unit should be multiplied to arrive at a standard value.
 */

/**
 * Different types of units usable for distances.
 * @enum {UnitConfiguration}
 */
export const lengthUnits = {
	ft: {
		label: "EH.Measurement.Length.Feet.Label[other]",
		abbreviation: "EH.Measurement.Length.Feet.Abbreviation",
		pluralPrefix: "EH.Measurement.Length.Feet.Label",
		conversion: 0
	},
	m: {
		label: "EH.Measurement.Length.Meters.Label[other]",
		abbreviation: "EH.Measurement.Length.Meters.Abbreviation",
		pluralPrefix: "EH.Measurement.Length.Meters.Label",
		conversion: 0
	}
};
preLocalize("lengthUnits", { key: "label" });
