import { preLocalize } from "./utils.mjs";

/**
 * Configuration data for abilities.
 *
 * @typedef {object} AbilityConfiguration
 * @property {string} label         Localized label.
 * @property {string} abbreviation  Localized abbreviation.
 */

/**
 * The set of Ability Scores used within the system.
 * @enum {AbilityConfiguration}
 */
export const abilities = {
	str: {
		label: "EH.Abilities.Strength.Label",
		abbreviation: "EH.Abilities.Strength.Abbreviation"
	},
	dex: {
		label: "EH.Abilities.Dexterity.Label",
		abbreviation: "EH.Abilities.Dexterity.Abbreviation"
	},
	con: {
		label: "EH.Abilities.Constitution.Label",
		abbreviation: "EH.Abilities.Constitution.Abbreviation"
	},
	int: {
		label: "EH.Abilities.Intelligence.Label",
		abbreviation: "EH.Abilities.Intelligence.Abbreviation"
	},
	wis: {
		label: "EH.Abilities.Wisdom.Label",
		abbreviation: "EH.Abilities.Wisdom.Abbreviation"
	},
	cha: {
		label: "EH.Abilities.Charisma.Label",
		abbreviation: "EH.Abilities.Charisma.Abbreviation"
	}
};
preLocalize("abilities", { keys: ["label", "abbreviation"] });

/**
 * Default ability scores to use for various calculations in the system.
 * @enum {string}
 */
export const defaultAbilities = {
	initiative: "dex",
	hitPoints: "con"
};

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Configuration data for conditions.
 *
 * @typedef {object} ConditionConfiguration
 * @property {string} label     Localized label.
 * @property {object} [levels]  Defines various levels of the condition if valid.
 */

/**
 * The set of Conditions used within the system.
 * @enum {ConditionConfiguration}
 */
export const conditions = {
	blinded: {
		label: "EH.Conditions.Blinded.Label"
	},
	burning: {
		label: "EH.Conditions.Burning.Label"
	},
	deafened: {
		label: "EH.Conditions.Deafened.Label"
	},
	distracted: {
		label: "EH.Conditions.Distracted.Label"
	},
	encumbered: {
		label: "EH.Conditions.Encumbered.Label"
	},
	exhaustion: {
		label: "EH.Conditions.Exhaustion.Label",
		levels: {
			1: {},
			2: {},
			3: {},
			4: {},
			5: {},
			6: {}
		}
	},
	frightened: {
		label: "EH.Conditions.Frightened.Label"
	},
	grappled: {
		label: "EH.Conditions.Grappled.Label"
	},
	incapacitated: {
		label: "EH.Conditions.Incapacitated.Label"
	},
	intoxication: {
		label: "EH.Conditions.Intoxication.Label",
		levels: {
			1: {},
			2: {},
			3: {},
			4: {}
		}
	},
	paralyzed: {
		label: "EH.Conditions.Paralyzed.Label"
	},
	prone: {
		label: "EH.Conditions.Prone.Label"
	},
	restrained: {
		label: "EH.Conditions.Restrained.Label"
	},
	sickened: {
		label: "EH.Conditions.Sickened.Label"
	},
	stunned: {
		label: "EH.Conditions.Stunned.Label"
	},
	unconcious: {
		label: "EH.Conditions.Unconcious.Label"
	}
};
preLocalize("conditions", { key: "label", sort: true });

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Maximum character level.
 * @type {number}
 */
export const maxLevel = 10;

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Configuration data for skills.
 *
 * @typedef {object} SkillConfiguration
 * @property {string} label    Localized label.
 * @property {string} ability  Default ability used by this skill.
 */

/**
 * The set of Skills used within the system.
 * @enum {SkillConfiguration}
 */
export const skills = {
	acro: {
		label: "EH.Skills.Acrobatics.Label",
		ability: "dex"
	},
	arts: {
		label: "EH.Skills.ArtsAndCrafts.Label",
		ability: "wis"
	},
	athl: {
		label: "EH.Skills.Athletics.Label",
		ability: "str"
	},
	comp: {
		label: "EH.Skills.Computers.Label",
		ability: "int"
	},
	dece: {
		label: "EH.Skills.Deception.Label",
		ability: "cha"
	},
	endu: {
		label: "EH.Skills.Endurance.Label",
		ability: "con"
	},
	inst: {
		label: "EH.Skills.Insight.Label",
		ability: "wis"
	},
	inti: {
		label: "EH.Skills.Intimidation.Label",
		ability: "cha"
	},
	inve: {
		label: "EH.Skills.Investigation.Label",
		ability: "int"
	},
	mech: {
		label: "EH.Skills.Mechanics.Label",
		ability: "int"
	},
	medi: {
		label: "EH.Skills.Medicine.Label",
		ability: "int"
	},
	nats: {
		label: "EH.Skills.NaturalSciences.Label",
		ability: "int"
	},
	perc: {
		label: "EH.Skills.Perception.Label",
		ability: "wis"
	},
	perf: {
		label: "EH.Skills.Performance.Label",
		ability: "cha"
	},
	pers: {
		label: "EH.Skills.Persuasion.Label",
		ability: "cha"
	},
	secu: {
		label: "EH.Skills.Security.Label",
		ability: "int"
	},
	slgt: {
		label: "EH.Skills.SleightOfHand.Label",
		ability: "dex"
	},
	socs: {
		label: "EH.Skills.SocialSciences.Label",
		ability: "int"
	},
	slth: {
		label: "EH.Skills.Stealth.Label",
		ability: "dex"
	},
	strt: {
		label: "EH.Skills.Streetwise.Label",
		ability: "wis"
	},
	surv: {
		label: "EH.Skills.Survival.Label",
		ability: "wis"
	},
	vehi: {
		label: "EH.Skills.Vehicles.Label",
		ability: "dex"
	}
};
preLocalize("skills", { key: "label", sort: true });