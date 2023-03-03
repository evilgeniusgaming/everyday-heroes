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
 * Configuration data for NPC creature types.
 *
 * @typedef {object} CreatureTypeConfiguration
 * @property {string} label - Localized label.
 * @property {object} [subtypes] - Object containing suggested sub-types for this type.
 */

/**
 * Types of creatures that NPCs can be.
 * @enum {CreatureTypeConfiguration}
 */
export const creatureTypes = {
	animal: {
		label: "EH.CreatureTypes.Animal.Label",
		subtypes: {
			prehistoric: "EH.CreatureTypes.Prehistoric.Label",
			swarm: "EH.CreatureTypes.Swarm.Label"
		}
	},
	monster: {
		label: "EH.CreatureTypes.Monster.Label",
		subtypes: {
			alien: "EH.CreatureTypes.Alien.Label",
			demon: "EH.CreatureTypes.Demon.Label",
			shifter: "EH.CreatureTypes.Shifter.Label",
			undead: "EH.CreatureTypes.Undead.Label"
		}
	},
	person: {
		label: "EH.CreatureTypes.Person.Label",
		subtypes: {
			human: "EH.CreatureTypes.Human.Label",
			mutant: "EH.CreatureTypes.Mutant.Label"
		}
	},
	robot: {
		label: "EH.CreatureTypes.Robot.Label",
		subtypes: {
			autonomous: "EH.CreatureTypes.Autonomous.Label",
			futuristic: "EH.CreatureTypes.Futuristic.Label",
			remoteControlled: "EH.CreatureTypes.RemoteControlled.Label"
		}
	}
};
preLocalize("creatureTypes", { key: "label", sort: true });
preLocalize("creatureTypes.animal.subtypes", { sort: true });
preLocalize("creatureTypes.monster.subtypes", { sort: true });
preLocalize("creatureTypes.person.subtypes", { sort: true });
preLocalize("creatureTypes.robot.subtypes", { sort: true });

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Configuration information for death saves.
 * @type {object}
 */
export const deathSave = {
	target: 10,
	successThreshold: 3,
	failureThreshold: 3
};

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Status of the character within the death-save process.
 * @enum {string}
 */
export const deathStatus = {
	alive: "EH.Death.Status.Alive",
	dying: "EH.Death.Status.Dying",
	dead: "EH.Death.Status.Dead",
	stable: "EH.Death.Status.Stable"
};

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Maximum hero level.
 * @type {number}
 */
export const maxLevel = 10;

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Possible roles for NPCs.
 * @enum {string}
 */
export const roles = {
	fodder: "EH.Roles.Fodder.Label",
	hulk: "EH.Roles.Hulk.Label",
	killer: "EH.Roles.Killer.Label",
	leader: "EH.Roles.Leader.Label",
	loner: "EH.Roles.Loner.Label",
	melee: "EH.Roles.Melee.Label",
	ranged: "EH.Roles.Ranged.Label",
	shadow: "EH.Roles.Shadow.Label",
	support: "EH.Roles.Support.Label",
	tank: "EH.Roles.Tank.Label"
};
preLocalize("roles", { sort: true });

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
