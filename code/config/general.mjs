import { preLocalize } from "./utils.mjs";

/**
 * General data model for data that just contains a label.
 *
 * @typedef {object} LabeledConfiguration
 * @property {string} label - Localized label.
 */

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Action Economy                           */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

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
	action: "EH.Action.Reload.Action",
	bonus: "EH.Action.Reload.Bonus",
	free: "EH.Action.Reload.Free"
};
preLocalize("actionTypesReload");

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Damage                                   */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Damage types available in Everyday Heroes.
 * @enum {LabeledConfiguration}
 */
export const damageTypes = {
	acid: {
		label: "EH.Damage.Type.Acid"
	},
	ballistic: {
		label: "EH.Damage.Type.Ballistic"
	},
	bludgeoning: {
		label: "EH.Damage.Type.Bludgeoning"
	},
	cold: {
		label: "EH.Damage.Type.Cold"
	},
	electrical: {
		label: "EH.Damage.Type.Electrical"
	},
	explosive: {
		label: "EH.Damage.Type.Explosive"
	},
	fire: {
		label: "EH.Damage.Type.Fire"
	},
	piercing: {
		label: "EH.Damage.Type.Piercing"
	},
	poison: {
		label: "EH.Damage.Type.Poison"
	},
	psychic: {
		label: "EH.Damage.Type.Psychic"
	},
	slashing: {
		label: "EH.Damage.Type.Slashing"
	}
};
preLocalize("damageTypes", { key: "label", sort: true });

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Dice                                     */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Progression of dice sizes used by Everyday Heroes.
 * @type {number[]}
 */
export const diceSteps = [4, 6, 8, 10, 12];

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Measurement                              */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Default units to use.
 * @enum {string}
 */
export const defaultUnits = {
	length: "foot"
};

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Configuration data for length units. The keys should be a unit as is usable in `Intl.NumberFormat`.
 *
 * @typedef {LabeledConfiguration} UnitConfiguration
 * @property {number} conversion - Number by which this unit should be multiplied to arrive at a standard value.
 */

/**
 * Different types of units usable for distances.
 * @enum {UnitConfiguration}
 */
export const lengthUnits = {
	foot: {
		label: "EH.Measurement.Length.Feet.Label",
		conversion: 1
	},
	mile: {
		label: "EH.Measurement.Length.Mile.Label",
		conversion: 5280
	},
	meter: {
		label: "EH.Measurement.Length.Meters.Label",
		conversion: 3.28084
	},
	kilometer: {
		label: "EH.Measurement.Length.Kilometer.Label",
		conversion: 3280.84
	}
};
preLocalize("lengthUnits", { key: "label" });

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Different types of units usable for movements.
 * @enum {UnitConfiguration}
 */
export const speedUnits = {
	"mile-per-hour": {
		label: "EH.Measurement.Speed.MilePerHour.Label",
		conversion: 1
	},
	"kilometer-per-hour": {
		label: "EH.Measurement.Speed.KilometerPerHour.Label",
		conversion: 1.60934
	},
	mach: {
		label: "EH.Measurement.Speed.Mach.Label",
		conversion: 767.269
	}
};
preLocalize("speedUnits", { key: "label" });
