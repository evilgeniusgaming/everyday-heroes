import { preLocalize } from "./utils.mjs";

/**
 * Configuration data for abilities.
 *
 * @typedef {LabeledConfiguration} AbilityConfiguration
 * @property {string} abbreviation  Localized abbreviation.
 */

/**
 * The set of Ability Scores used within the system.
 * @enum {AbilityConfiguration}
 */
export const abilities = {
	str: {
		label: "EH.Ability.Strength.Label",
		abbreviation: "EH.Ability.Strength.Abbreviation"
	},
	dex: {
		label: "EH.Ability.Dexterity.Label",
		abbreviation: "EH.Ability.Dexterity.Abbreviation"
	},
	con: {
		label: "EH.Ability.Constitution.Label",
		abbreviation: "EH.Ability.Constitution.Abbreviation"
	},
	int: {
		label: "EH.Ability.Intelligence.Label",
		abbreviation: "EH.Ability.Intelligence.Abbreviation"
	},
	wis: {
		label: "EH.Ability.Wisdom.Label",
		abbreviation: "EH.Ability.Wisdom.Abbreviation"
	},
	cha: {
		label: "EH.Ability.Charisma.Label",
		abbreviation: "EH.Ability.Charisma.Abbreviation"
	}
};
preLocalize("abilities", { keys: ["label", "abbreviation"] });

/**
 * Default ability scores to use for various calculations in the system.
 * @enum {string}
 */
export const defaultAbilities = {
	defense: "dex",
	hitPoints: "con",
	melee: "str",
	initiative: "dex",
	ranged: "dex"
};

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Configuration data for conditions.
 *
 * @typedef {LabeledConfiguration} ConditionConfiguration
 * @property {object} [levels]  Defines various levels of the condition if valid.
 */

/**
 * The set of Conditions used within the system.
 * @enum {ConditionConfiguration}
 */
export const conditions = {
	blinded: {
		label: "EH.Condition.Blinded.Label"
	},
	burning: {
		label: "EH.Condition.Burning.Label"
	},
	deafened: {
		label: "EH.Condition.Deafened.Label"
	},
	distracted: {
		label: "EH.Condition.Distracted.Label"
	},
	encumbered: {
		label: "EH.Condition.Encumbered.Label"
	},
	exhaustion: {
		label: "EH.Condition.Exhaustion.Label",
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
		label: "EH.Condition.Frightened.Label"
	},
	grappled: {
		label: "EH.Condition.Grappled.Label"
	},
	incapacitated: {
		label: "EH.Condition.Incapacitated.Label"
	},
	intoxication: {
		label: "EH.Condition.Intoxication.Label",
		levels: {
			1: {},
			2: {},
			3: {},
			4: {}
		}
	},
	paralyzed: {
		label: "EH.Condition.Paralyzed.Label"
	},
	prone: {
		label: "EH.Condition.Prone.Label"
	},
	restrained: {
		label: "EH.Condition.Restrained.Label"
	},
	sickened: {
		label: "EH.Condition.Sickened.Label"
	},
	stunned: {
		label: "EH.Condition.Stunned.Label"
	},
	unconcious: {
		label: "EH.Condition.Unconcious.Label"
	}
};
preLocalize("conditions", { key: "label", sort: true });

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Configuration data for NPC creature types.
 *
 * @typedef {LabeledConfiguration} CreatureTypeConfiguration
 * @property {object} [subtypes] - Object containing suggested sub-types for this type.
 */

/**
 * Types of creatures that NPCs can be.
 * @enum {CreatureTypeConfiguration}
 */
export const creatureTypes = {
	animal: {
		label: "EH.Creature.Type.Animal.Label",
		subtypes: {
			prehistoric: "EH.Creature.Type.Prehistoric.Label",
			swarm: "EH.Creature.Type.Swarm.Label"
		}
	},
	monster: {
		label: "EH.Creature.Type.Monster.Label",
		subtypes: {
			alien: "EH.Creature.Type.Alien.Label",
			demon: "EH.Creature.Type.Demon.Label",
			shifter: "EH.Creature.Type.Shifter.Label",
			undead: "EH.Creature.Type.Undead.Label"
		}
	},
	person: {
		label: "EH.Creature.Type.Person.Label",
		subtypes: {
			human: "EH.Creature.Type.Human.Label",
			mutant: "EH.Creature.Type.Mutant.Label"
		}
	},
	robot: {
		label: "EH.Creature.Type.Robot.Label",
		subtypes: {
			autonomous: "EH.Creature.Type.Autonomous.Label",
			futuristic: "EH.Creature.Type.Futuristic.Label",
			remoteControlled: "EH.Creature.Type.RemoteControlled.Label"
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
	fodder: "EH.Role.Fodder.Label",
	hulk: "EH.Role.Hulk.Label",
	killer: "EH.Role.Killer.Label",
	leader: "EH.Role.Leader.Label",
	loner: "EH.Role.Loner.Label",
	melee: "EH.Role.Melee.Label",
	ranged: "EH.Role.Ranged.Label",
	shadow: "EH.Role.Shadow.Label",
	support: "EH.Role.Support.Label",
	tank: "EH.Role.Tank.Label"
};
preLocalize("roles", { sort: true });

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Configuration data for skills.
 *
 * @typedef {LabeledConfiguration} SkillConfiguration
 * @property {string} ability - Default ability used by this skill.
 */

/**
 * The set of Skills used within the system.
 * @enum {SkillConfiguration}
 */
export const skills = {
	acro: {
		label: "EH.Skill.Acrobatics.Label",
		ability: "dex"
	},
	arts: {
		label: "EH.Skill.ArtsAndCrafts.Label",
		ability: "wis"
	},
	athl: {
		label: "EH.Skill.Athletics.Label",
		ability: "str"
	},
	comp: {
		label: "EH.Skill.Computers.Label",
		ability: "int"
	},
	dece: {
		label: "EH.Skill.Deception.Label",
		ability: "cha"
	},
	endu: {
		label: "EH.Skill.Endurance.Label",
		ability: "con"
	},
	inst: {
		label: "EH.Skill.Insight.Label",
		ability: "wis"
	},
	inti: {
		label: "EH.Skill.Intimidation.Label",
		ability: "cha"
	},
	inve: {
		label: "EH.Skill.Investigation.Label",
		ability: "int"
	},
	mech: {
		label: "EH.Skill.Mechanics.Label",
		ability: "int"
	},
	medi: {
		label: "EH.Skill.Medicine.Label",
		ability: "int"
	},
	nats: {
		label: "EH.Skill.NaturalSciences.Label",
		ability: "int"
	},
	perc: {
		label: "EH.Skill.Perception.Label",
		ability: "wis"
	},
	perf: {
		label: "EH.Skill.Performance.Label",
		ability: "cha"
	},
	pers: {
		label: "EH.Skill.Persuasion.Label",
		ability: "cha"
	},
	secu: {
		label: "EH.Skill.Security.Label",
		ability: "int"
	},
	slgt: {
		label: "EH.Skill.SleightOfHand.Label",
		ability: "dex"
	},
	socs: {
		label: "EH.Skill.SocialSciences.Label",
		ability: "int"
	},
	slth: {
		label: "EH.Skill.Stealth.Label",
		ability: "dex"
	},
	strt: {
		label: "EH.Skill.Streetwise.Label",
		ability: "wis"
	},
	surv: {
		label: "EH.Skill.Survival.Label",
		ability: "wis"
	},
	vehi: {
		label: "EH.Skill.Vehicles.Label",
		ability: "dex"
	}
};
preLocalize("skills", { key: "label", sort: true });
