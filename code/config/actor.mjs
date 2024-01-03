import { preLocalize } from "./utils.mjs";

/**
 * Broad actor categories and which types belong within them.
 * @enum {CategoryConfiguration}
 */
export const actorCategories = {
	people: {
		label: "EH.Actor.Category.People.Label",
		types: ["hero", "npc"]
	},
	// places: {
	// 	label: "EH.Actor.Category.Places.Label",
	// 	types: []
	// },
	things: {
		label: "EH.Actor.Category.Things.Label",
		types: ["vehicle"]
	}
};
preLocalize("actorCategories", { key: "label" });

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

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

/**
 * Abilities that are used by vehicles.
 * @type {Set<string>}
 */
export const vehicleAbilities = new Set(["str", "dex", "con"]);

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Configuration data for conditions.
 *
 * @typedef {LabeledConfiguration} ConditionConfiguration
 * @property {string} icon - Icon used to represent this condition on the token overlay.
 * @property {string} [coreEffect] - Special status effect value used for this condition.
 * @property {number} [levels] - If applicable, how many levels are represented by this condition.
 */

/**
 * The set of Conditions used within the system.
 * @enum {ConditionConfiguration}
 */
export const conditions = {
	blinded: {
		label: "EH.Condition.Blinded.Label",
		icon: "systems/everyday-heroes/artwork/svg/conditions/blinded.svg",
		coreEffect: "BLIND"
	},
	"blown-tires": {
		label: "EH.Condition.BlownTires.Label",
		icon: "systems/everyday-heroes/artwork/svg/conditions/blown-tires.svg"
	},
	"body-damage": {
		label: "EH.Condition.BodyDamage.Label",
		icon: "systems/everyday-heroes/artwork/svg/conditions/body-damage.svg"
	},
	burning: {
		label: "EH.Condition.Burning.Label",
		icon: "systems/everyday-heroes/artwork/svg/conditions/burning.svg"
	},
	deafened: {
		label: "EH.Condition.Deafened.Label",
		icon: "systems/everyday-heroes/artwork/svg/conditions/deafened.svg"
	},
	distracted: {
		label: "EH.Condition.Distracted.Label",
		icon: "systems/everyday-heroes/artwork/svg/conditions/distracted.svg"
	},
	encumbered: {
		label: "EH.Condition.Encumbered.Label",
		icon: "systems/everyday-heroes/artwork/svg/conditions/encumbered.svg"
	},
	exhausted: {
		label: "EH.Condition.Exhausted.Label",
		icon: "systems/everyday-heroes/artwork/svg/conditions/exhausted.svg",
		levels: 6
	},
	frightened: {
		label: "EH.Condition.Frightened.Label",
		icon: "systems/everyday-heroes/artwork/svg/conditions/frightened.svg"
	},
	grappled: {
		label: "EH.Condition.Grappled.Label",
		icon: "systems/everyday-heroes/artwork/svg/conditions/grappled.svg"
	},
	incapacitated: {
		label: "EH.Condition.Incapacitated.Label",
		icon: "systems/everyday-heroes/artwork/svg/conditions/incapacitated.svg"
	},
	intoxicated: {
		label: "EH.Condition.Intoxicated.Label",
		icon: "systems/everyday-heroes/artwork/svg/conditions/intoxicated.svg",
		levels: 4
	},
	"loss-of-control": {
		label: "EH.Condition.LossOfControl.Label",
		icon: "systems/everyday-heroes/artwork/svg/conditions/loss-of-control.svg"
	},
	"loss-of-power": {
		label: "EH.Condition.LossOfPower.Label",
		icon: "systems/everyday-heroes/artwork/svg/conditions/loss-of-power.svg"
	},
	paralyzed: {
		label: "EH.Condition.Paralyzed.Label",
		icon: "systems/everyday-heroes/artwork/svg/conditions/paralyzed.svg"
	},
	prone: {
		label: "EH.Condition.Prone.Label",
		icon: "systems/everyday-heroes/artwork/svg/conditions/prone.svg"
	},
	restrained: {
		label: "EH.Condition.Restrained.Label",
		icon: "systems/everyday-heroes/artwork/svg/conditions/restrained.svg"
	},
	sickened: {
		label: "EH.Condition.Sickened.Label",
		icon: "systems/everyday-heroes/artwork/svg/conditions/sickened.svg"
	},
	stunned: {
		label: "EH.Condition.Stunned.Label",
		icon: "systems/everyday-heroes/artwork/svg/conditions/stunned.svg"
	},
	totaled: {
		label: "EH.Condition.Totaled.Label",
		icon: "systems/everyday-heroes/artwork/svg/conditions/totaled.svg"
	},
	unconcious: {
		label: "EH.Condition.Unconcious.Label",
		icon: "systems/everyday-heroes/artwork/svg/conditions/unconcious.svg"
	}
};
preLocalize("conditions", { key: "label", sort: true });

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Conditions that can be applied to various Actor types.
 * @enum {string[]}
 */
export const applicableConditions = {
	hero: [
		"blinded", "burning", "deafened", "distracted", "encumbered", "exhausted", "frightened", "grappled",
		"incapacitated", "intoxicated", "paralyzed", "prone", "restrained", "sickened", "stunned", "unconcious"
	],
	vehicle: [
		"blown-tires", "body-damage", "loss-of-control", "loss-of-power", "totaled"
	]
};
applicableConditions.npc = applicableConditions.hero;

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Core status effects that don't correspond to specific conditions but should still be retained.
 * @type {string[]}
 */
export const retainedStatusEffects = ["dead"];

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
preLocalize("deathStatus");

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Maximum hero level.
 * @type {number}
 */
export const maxLevel = 10;

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Configuration data for movement tags.
 *
 * @typedef {LabeledConfiguration} MovementTagConfiguration
 * @property {string} [associatedType] - Which special movement type is this tag associated with?
 */

/**
 * Tags that can be added to describe an actor's movement.
 * @enum {string}
 */
export const movementTags = {
	hover: {
		label: "EH.Movement.Tag.Hover.Label",
		associatedType: "fly"
	}
};
preLocalize("movementTags", { key: "label", sort: true });

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Pre-suggested movement types available on actors.
 * @enum {string}
 */
export const movementTypes = {
	burrow: "EH.Movement.Type.Burrow.Label",
	climb: "EH.Movement.Type.Climb.Label",
	fly: "EH.Movement.Type.Fly.Label",
	swim: "EH.Movement.Type.Swim.Label"
};
preLocalize("movementTypes");

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Configuration data for actor resources.
 *
 * @typedef {LabeledConfiguration} ResourceConfiguration
 * @property {string} backdrop - Background displayed around the resource box.
 * @property {string} formula - Default max formula for the resource.
 * @property {object} recovery
 * @property {string} recovery.period - Period over which the resource recovers.
 * @property {string} recovery.formula - Formula used when recovering this resource. Blank means all uses are recovered.
 */

/**
 * Resources that can be provided by archetypes or feats.
 * @enum {ResourceConfiguration}
 */
export const resources = {
	genius: {
		label: "EH.Resource.Genius.Label",
		backdrop: "systems/everyday-heroes/artwork/interface/genius.png",
		recovery: {
			period: "lr"
		}
	},
	focus: {
		label: "EH.Resource.Focus.Label",
		backdrop: "systems/everyday-heroes/artwork/interface/focus.png",
		recovery: {
			period: "sr"
		}
	},
	influence: {
		label: "EH.Resource.Influence.Label",
		backdrop: "systems/everyday-heroes/artwork/interface/influence.png",
		recovery: {
			period: "sr"
		}
	}
};
preLocalize("resources", { key: "label" });

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
 * Possible special senses offered.
 * @enum {string}
 */
export const senses = {
	nightvision: "EH.Sense.Nightvision.Label"
};
preLocalize("senses", { sort: true });

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Configuration data for sheet sections.
 *
 * @typedef {object} SheetSectionConfiguration
 * @property {string} tab - Name of the tab on which this section will appear. Places the section into an object
 *                          for that tab's name within the sheet rendering context.
 * @property {object[]} types - Set of filters for object types that should appear in this section.
 * @property {object[]} create - Create controls presented. If not provided, controls will be generated for each type.
 * @property {object} [primaryType] - Filters for an object that will appear as the primary item of this section.
 * @property {string} [label] - Label to use instead of auto-generating one.
 * @property {object} [options]
 * @property {boolean} [options.actions=true] - Should actions be displayed for items in this section?
 * @property {boolean} [options.autoHide=false] - Should this section be hidden unless it has items?
 * @property {boolean} [options.equippable=false] - Should the items in this section be equippable?
 * @property {string} [options.limited] - An item type here will limit the amount of items of that type can appear
 *                                        in this section using a formula defined in actor data.
 */

/**
 * Sections that will appear on actor sheets. They are arrays of objects grouped by actor type.
 * @enum {SheetSectionConfiguration[]}
 */
export const sheetSections = {
	hero: [
		{
			tab: "features",
			types: [{type: "talent", "system.type.value": "archetype"}],
			primaryType: {type: "archetype"}
		},
		{
			tab: "features",
			types: [{type: "talent", "system.type.value": "class"}],
			primaryType: {type: "class"}
		},
		{
			tab: "features",
			types: [{type: "specialFeature", "system.type.value": "background"}],
			primaryType: {type: "background"}
		},
		{
			tab: "features",
			types: [{type: "specialFeature", "system.type.value": "profession"}],
			primaryType: {type: "profession"}
		},
		{
			tab: "features",
			types: [{type: "plan"}],
			options: { autoHide: true, limited: "plan" }
		},
		{
			tab: "features",
			types: [{type: "trick"}],
			options: { autoHide: true, limited: "trick" }
		},
		{
			tab: "features",
			types: [{type: "feat"}]
		},
		{
			tab: "inventory",
			types: [{type: "armor"}],
			options: { equippable: true }
		},
		{
			tab: "inventory",
			types: [{type: "weapon"}],
			options: { equippable: true }
		},
		{
			tab: "inventory",
			types: [{type: "ammunition"}, {type: "explosive"}],
			options: { autoHide: true }
		},
		{
			tab: "inventory",
			types: [{type: "clothes"}, {type: "gear"}]
		}
	],
	npc: [
		{
			tab: "inventory",
			types: [{type: "armor"}],
			options: { equippable: true }
		},
		{
			tab: "inventory",
			types: [{type: "npcWeapon"}],
			options: { equippable: true }
		},
		{
			tab: "inventory",
			types: [{type: "ammunition"}, {type: "npcExplosive"}],
			options: { autoHide: true }
		},
		{
			tab: "inventory",
			types: [{type: "clothes"}],
			options: { autoHide: true }
		},
		{
			tab: "inventory",
			types: [{type: "gear"}],
			options: { autoHide: true }
		},
		{
			tab: "inventory",
			types: [{type: "plan"}],
			options: { autoHide: true }
		},
		{
			tab: "inventory",
			types: [{type: "trick"}],
			options: { autoHide: true }
		},
		{
			tab: "inventory",
			types: [{type: "npcFeature"}]
		}
	],
	vehicle: [
		{
			tab: "contents",
			types: [{type: "vehicleWeapon", "system.equipped": true}],
			create: [
				{label: "EH.Item.Type.Weapon[one]", dataset: { type: "vehicleWeapon" }}
			],
			options: { equippable: true }
		},
		{
			tab: "contents",
			types: [{type: "vehicleModification"}],
			options: { autoHide: true }
		},
		{
			tab: "contents",
			types: [
				{type: "vehicleWeapon", "system.equipped": false},
				{type: "ammunition"}, {type: "explosive"},
				{type: "armor"}, {type: "clothes"}, {type: "gear"}
			],
			create: [],
			label: "EH.Vehicle.Cargo",
			options: { actions: false }
		}
	]
};

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Configuration data for actor sizes.
 *
 * @typedef {LabeledConfiguration} SizeConfiguration
 * @property {number} token - Default token size.
 * @property {number} [titanicToken] - Alternate Token size used for Titanic creatures of this size category.
 * @property {number} hitDie - Default hit die denomination for NPCs of this size.
 */

/**
 * Possible sizes for actors.
 * @enum {SizeConfiguration}
 */
export const sizes = {
	tiny: {
		label: "EH.Size.Tiny.Label",
		token: 0.5,
		hitDie: 4
	},
	small: {
		label: "EH.Size.Small.Label",
		token: 1,
		hitDie: 6
	},
	medium: {
		label: "EH.Size.Medium.Label",
		token: 1,
		hitDie: 8
	},
	large: {
		label: "EH.Size.Large.Label",
		token: 2,
		hitDie: 10
	},
	huge: {
		label: "EH.Size.Huge.Label",
		token: 3,
		titanicToken: 2,
		hitDie: 12
	},
	gargantuan: {
		label: "EH.Size.Gargantuan.Label",
		token: 4,
		titanicToken: 3,
		hitDie: 20
	}
};
preLocalize("sizes", { key: "label" });

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Construct titanic versions of all the standard sizes. Must be called after localization is loaded to
 * allow the names to be formatted properly.
 */
export function prepareTitanicSizes() {
	for ( const [key, normalSize] of Object.entries(sizes) ) {
		const size = sizes[`${key}Titan`] = { ...normalSize, titanic: true };
		if ( size.titanicToken ) {
			size.token = size.titanicToken;
			delete size.titanicToken;
		}
		size.label = game.i18n.format("EH.Size.Titan.LabelSpecific", { size: normalSize.label });
	}
}

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

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Attributes that can be tracked on token resource bars.
 * @type {string[]}
 */
export const tokenAttributes = [
	"abilities.*.value",
	"attributes.defense.value",
	"skills.*.passive"
];

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * General categories to which vehicles can belong.
 * @enum {LabeledConfiguration}
 */
export const vehicleCategories = {
	civilian: {
		label: "EH.Vehicle.Category.Civilian.Label"
	},
	commercial: {
		label: "EH.Vehicle.Category.Commercial.Label"
	},
	lawEnforcement: {
		label: "EH.Vehicle.Category.LawEnforcement.Label"
	},
	military: {
		label: "EH.Vehicle.Category.Military.Label"
	}
};
preLocalize("vehicleCategories", { key: "label" });

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Properties for vehicle actors.
 * @enum {HintedConfiguration}
 */
export const vehicleProperties = {
	accidentProne: {
		label: "EH.Vehicle.Property.AccidentProne.Label",
		hint: "EH.Vehicle.Property.AccidentProne.Hint"
	},
	airspeed: {
		label: "EH.Vehicle.Property.Airspeed.Label",
		hint: "EH.Vehicle.Property.Airspeed.Hint"
	},
	allTerrain: {
		label: "EH.Vehicle.Property.AllTerrain.Label",
		hint: "EH.Vehicle.Property.AllTerrain.Hint"
	},
	bulletproof: {
		label: "EH.Vehicle.Property.Bulletproof.Label",
		hint: "EH.Vehicle.Property.Bulletproof.Hint"
	},
	enclosed: {
		label: "EH.Vehicle.Property.Enclosed.Label",
		hint: "EH.Vehicle.Property.Enclosed.Hint"
	},
	exposed: {
		label: "EH.Vehicle.Property.Exposed.Label",
		hint: "EH.Vehicle.Property.Exposed.Hint"
	},
	extraWheels: {
		label: "EH.Vehicle.Property.ExtraWheels.Label",
		hint: "EH.Vehicle.Property.ExtraWheels.Hint"
	},
	gliding: {
		label: "EH.Vehicle.Property.Gliding.Label",
		hint: "EH.Vehicle.Property.Gliding.Hint"
	},
	musclePowered: {
		label: "EH.Vehicle.Property.MusclePowered.Label",
		hint: "EH.Vehicle.Property.MusclePowered.Hint"
	},
	railed: {
		label: "EH.Vehicle.Property.Railed.Label",
		hint: "EH.Vehicle.Property.Railed.Hint"
	},
	restricted: {
		label: "EH.Weapon.Property.Restricted.Label",
		hint: "EH.Weapon.Property.Restricted.Hint"
	},
	special: {
		label: "EH.Weapon.Property.Special.Label",
		hint: "EH.Weapon.Property.Special.Hint"
	},
	stable: {
		label: "EH.Vehicle.Property.Stable.Label",
		hint: "EH.Vehicle.Property.Stable.Hint"
	},
	tracked: {
		label: "EH.Vehicle.Property.Tracked.Label",
		hint: "EH.Vehicle.Property.Tracked.Hint"
	}
};
preLocalize("vehicleProperties", { key: "label", sort: true });

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Configuration data for vehicle rolls.
 *
 * @typedef {LabeledConfiguration} VehicleRollConfiguration
 * @property {string} icon - Icon used on roll buttons.
 * @property {string} type - Type of roll to perform (e.g. "check", "damage", "save").
 * @property {string} ability - Ability associated with this roll by default.
 * @property {string} mode - For check rolls, Whether the associated ability is added to the roll ("add") or whether the
 *                           roll bonus is capped by that ability ("max"). For damage rolls this indicates what type of
 *                           damage is represented by this roll.
 */

/**
 * Basic rolls that can be performed by a vehicle.
 * @enum {VehicleRollConfiguration}
 */
export const vehicleRolls = {
	speed: {
		label: "EH.Vehicle.Roll.SpeedContest.Label",
		icon: "systems/everyday-heroes/artwork/svg/action/vehicle-speed.svg",
		type: "vehicle-check",
		ability: "str",
		mode: "add"
	},
	maneuverability: {
		label: "EH.Vehicle.Roll.ManeuverabilityContest.Label",
		icon: "systems/everyday-heroes/artwork/svg/action/vehicle-maneuverability.svg",
		type: "vehicle-check",
		ability: "dex",
		mode: "add"
	},
	stunt: {
		label: "EH.Vehicle.Roll.StuntCheck.Label",
		icon: "systems/everyday-heroes/artwork/svg/action/vehicle-stunt.svg",
		type: "vehicle-check",
		ability: "dex",
		mode: "max"
	},
	crash: {
		label: "EH.Vehicle.Roll.CrashCheck.Label",
		icon: "systems/everyday-heroes/artwork/svg/action/vehicle-crash.svg",
		type: "vehicle-check",
		ability: "dex",
		mode: "add"
	},
	vehicleDamage: {
		label: "EH.Vehicle.Roll.VehicleDamage.Label",
		icon: "systems/everyday-heroes/artwork/svg/action/vehicle-damage-vehicle.svg",
		type: "vehicle-damage",
		mode: "vehicle"
	},
	passengerDamage: {
		label: "EH.Vehicle.Roll.PassengerDamage.Label",
		icon: "systems/everyday-heroes/artwork/svg/action/vehicle-damage-passenger.svg",
		type: "vehicle-damage",
		mode: "passenger"
	}
};
preLocalize("vehicleRolls", { key: "label" });

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Valid actor sizes for vehicles.
 * @type {string[]}
 */
export const vehicleSizes = ["medium", "large", "huge", "gargantuan"];

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Configuration data for vehicle speed categories.
 *
 * @typedef {HintedConfiguration} VehicleSpeedCategoryConfiguration
 * @property {object} [damage] - Damage for crashes at this speed. Each can be either a roll formula or
 *                               a localizable label for the effect.
 * @property {string} [damage.vehicle]
 * @property {string} [damage.passenger]
 * @property {number} [dc] - Adjustment to crash DC when traveling at this speed.
 * @property {number} [pv] - Adjustment to crash damage PV when traveling at this speed.
 */

/**
 * Speed categories at which a vehicle can travel.
 * @param {VehicleSpeedCategoryConfiguration}
 */
export const vehicleSpeedCategories = {
	stopped: {
		label: "EH.Vehicle.Trait.SpeedCategory.Stopped.Label",
		hint: "EH.Vehicle.Trait.SpeedCategory.Stopped.Hint"
	},
	low: {
		label: "EH.Vehicle.Trait.SpeedCategory.Low.Label",
		hint: "EH.Vehicle.Trait.SpeedCategory.Low.Hint",
		damage: {
			vehicle: "4d6"
		},
		dc: -5,
		pv: 0
	},
	mid: {
		label: "EH.Vehicle.Trait.SpeedCategory.Mid.Label",
		hint: "EH.Vehicle.Trait.SpeedCategory.Mid.Hint",
		damage: {
			vehicle: "8d6",
			passenger: "2d6"
		},
		pv: 1
	},
	high: {
		label: "EH.Vehicle.Trait.SpeedCategory.High.Label",
		hint: "EH.Vehicle.Trait.SpeedCategory.High.Hint",
		damage: {
			vehicle: "12d6",
			passenger: "3d6"
		},
		dc: 5,
		pv: 1
	},
	extreme: {
		label: "EH.Vehicle.Trait.SpeedCategory.Extreme.Label",
		hint: "EH.Vehicle.Trait.SpeedCategory.Extreme.Hint",
		damage: {
			vehicle: "16d6",
			passenger: "4d6"
		},
		dc: 10,
		pv: 2
	},
	airspeed: {
		label: "EH.Vehicle.Trait.SpeedCategory.Airspeed.Label",
		hint: "EH.Vehicle.Trait.SpeedCategory.Airspeed.Hint",
		damage: {
			vehicle: "∞",
			vehicleHint: "EH.Vehicle.Trait.SpeedCategory.Airspeed.Destruction",
			passenger: "∞",
			passengerHint: "EH.Vehicle.Trait.SpeedCategory.Airspeed.Death"
		}
	}
};
preLocalize("vehicleSpeedCategories", { key: "label" });

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Types of vehicles available.
 * @enum {LabeledConfiguration}
 */
export const vehicleTypes = {
	land: {
		label: "EH.Vehicle.Type.Land.Label"
	},
	water: {
		label: "EH.Vehicle.Type.Water.Label"
	},
	air: {
		label: "EH.Vehicle.Type.Air.Label"
	},
	space: {
		label: "EH.Vehicle.Type.Space.Label"
	}
};
preLocalize("vehicleTypes", { key: "label" });
