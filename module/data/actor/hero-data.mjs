import SystemDataModel from "../abstract/system-data-model.mjs";
import FormulaField from "../fields/formula-field.mjs";
import MappingField from "../fields/mapping-field.mjs";
import { simplifyBonus } from "../../utils.mjs";
import Proficiency from "../../documents/proficiency.mjs";

/**
 * Data definition for Character actors.
 */
export default class HeroData extends SystemDataModel {
	static defineSchema() {
		return {
			abilities: new MappingField(new foundry.data.fields.SchemaField({
				value: new foundry.data.fields.NumberField({
					nullable: false, initial: 10, min: 0, integer: true, label: "EH.Ability.Score[one]"
				}),
				saveProficiency: new foundry.data.fields.SchemaField({
					multiplier: new foundry.data.fields.NumberField({
						nullable: false, initial: 0, min: 0, max: 1, integer: true, label: "EH.Proficiency.Multiplier"
					})
				}, {label: "EH.Proficiency.Label[one]"}),
				bonuses: new foundry.data.fields.SchemaField({
					check: new FormulaField({label: "EH.Ability.Bonus.Check"}),
					dc: new FormulaField({label: "EH.Ability.Bonus.DC"}),
					save: new FormulaField({label: "EH.Ability.Bonus.Save"})
				})
			}), {
				initialKeys: CONFIG.EverydayHeroes.abilities, prepareKeys: true, label: "EH.Ability.Label[other]"
			}),
			attributes: new foundry.data.fields.SchemaField({
				death: new foundry.data.fields.SchemaField({
					status: new foundry.data.fields.StringField({initial: "alive", blank: false, label: "EH.Death.Status.Label"}),
					success: new foundry.data.fields.NumberField({
						nullable: false, initial: 0, min: 0, integer: true, label: "EH.Death.Success"
					}),
					failure: new foundry.data.fields.NumberField({
						nullable: false, initial: 0, min: 0, integer: true, label: "EH.Death.Failure"
					}),
					bonus: new FormulaField({label: "EH.Death.Bonus"}),
					overrides: new foundry.data.fields.SchemaField({
						success: new foundry.data.fields.NumberField({label: "EH.Death.Override.Success"}),
						failure: new foundry.data.fields.NumberField({label: "EH.Death.Override.Failure"}),
						target: new foundry.data.fields.NumberField({label: "EH.Death.Override.Target"})
					})
				}, {label: "EH.Death.Label[other]"}),
				hd: new foundry.data.fields.SchemaField({
					spent: new foundry.data.fields.NumberField({initial: 0, min: 0, integer: true, label: "EH.HitDice.Spent"})
				}, {label: "EH.HitDice.Labe[other]"}),
				hp: new foundry.data.fields.SchemaField({
					value: new foundry.data.fields.NumberField({
						nullable: false, initial: 0, min: 0, integer: true, label: "EH.HitPoints.Current"
					}),
					temp: new foundry.data.fields.NumberField({
						initial: null, min: 0, integer: true, label: "EH.HitPoints.Temp"
					}),
					ability: new foundry.data.fields.StringField({
						initial: () => CONFIG.EverydayHeroes.defaultAbilities.hitPoints, label: "EH.Ability.Label[one]"
					}),
					// TODO: Does Everyday Heroes need temp max support?
					bonuses: new foundry.data.fields.SchemaField({
						level: new FormulaField({deterministic: true, label: ""}),
						overall: new FormulaField({deterministic: true, label: ""})
					})
				}, {label: ""}),
				initiative: new foundry.data.fields.SchemaField({
					ability: new foundry.data.fields.StringField({
						initial: () => CONFIG.EverydayHeroes.defaultAbilities.initiative, label: "EH.Ability.Label[one]"
					}),
					bonus: new FormulaField({label: "EH.Initiative.Bonus.Label"})
				}, {label: "EH.Initiative.Label"}),
				movement: new foundry.data.fields.SchemaField({
					value: new foundry.data.fields.NumberField({
						nullable: false, initial: 30, min: 0, step: 0.1, label: ""
					}),
					units: new foundry.data.fields.StringField({initial: "ft", label: "EH.Measurement.Units"})
					// TODO: Set default based on default units setting
				})
			}, {label: ""}),
			biography: new foundry.data.fields.SchemaField({
				value: new foundry.data.fields.HTMLField({label: "EH.Biography.Label"}),
				public: new foundry.data.fields.HTMLField({label: "EH.Biography.Public"}),
				notes: new foundry.data.fields.HTMLField({label: "EH.Biography.Notes"}),
				attachments: new foundry.data.fields.ArrayField(
					new foundry.data.fields.StringField(), {label: "EH.Biography.Attachments"}
				),
				beliefs: new foundry.data.fields.ArrayField(
					new foundry.data.fields.StringField(), {label: "EH.Biography.Beliefs"}
				),
				flaws: new foundry.data.fields.ArrayField(
					new foundry.data.fields.StringField(), {label: "EH.Biography.Flaws"}
				),
				motivations: new foundry.data.fields.ArrayField(
					new foundry.data.fields.StringField(), {label: "EH.Biography.Motivations"}
				),
				quirks: new foundry.data.fields.ArrayField(
					new foundry.data.fields.StringField(), {label: "EH.Biography.Quirks"}
				),
				virtues: new foundry.data.fields.ArrayField(
					new foundry.data.fields.StringField(), {label: "EH.Biography.Virtues"}
				),
				age: new foundry.data.fields.StringField({label: "EH.Biography.Age"}),
				ancestry: new foundry.data.fields.StringField({label: "EH.Biography.Ancestry"}),
				eyes: new foundry.data.fields.StringField({label: "EH.Biography.Eyes"}),
				hair: new foundry.data.fields.StringField({label: "EH.Biography.Hair"}),
				height: new foundry.data.fields.StringField({label: "EH.Biography.Height"}),
				marital: new foundry.data.fields.StringField({label: "EH.Biography.MaritalStatus"}),
				pronouns: new foundry.data.fields.StringField({label: "EH.Biography.Pronouns"}),
				role: new foundry.data.fields.StringField({label: "EH.Biography.Role"}),
				skin: new foundry.data.fields.StringField({label: "EH.Biography.Skin"}),
				weight: new foundry.data.fields.StringField({label: "EH.Biography.Weight"})
			}),
			bonuses: new foundry.data.fields.SchemaField({
				ability: new foundry.data.fields.SchemaField({
					check: new FormulaField({label: "EH.Ability.Bonus.Check"}),
					dc: new FormulaField({label: "EH.Ability.Bonus.DC"}),
					save: new FormulaField({label: "EH.Ability.Bonus.Save"})
				}),
				attack: new MappingField(new FormulaField()),
				damage: new MappingField(new FormulaField()),
				skill: new foundry.data.fields.SchemaField({
					check: new FormulaField({label: "EH.Skill.Bonuses.Check"}),
					passive: new FormulaField({label: "EH.Skill.Bonuses.Passive"})
				})
			}, {label: ""}),
			conditions: new foundry.data.fields.SchemaField({
				// TODO: Figure out how to track exhaustion and intoxication and support custom conditions with levels
			}),
			details: new foundry.data.fields.SchemaField({
				level: new foundry.data.fields.NumberField({
					nullable: false, initial: 1, min: 1, max: CONFIG.EverydayHeroes.maxLevel, integer: true, label: ""
				})
			}),
			items: new MappingField(new foundry.data.fields.SchemaField({
				equipped: new foundry.data.fields.BooleanField({label: ""}),
				mode: new foundry.data.fields.StringField({label: ""})
			})),
			resources: new foundry.data.fields.SchemaField({
				inspiration: new foundry.data.fields.BooleanField({label: "EH.Resource.Inspiration"})
			}, {label: "EH.Resource.Label[other]"}),
			skills: new MappingField(new foundry.data.fields.SchemaField({
				ability: new foundry.data.fields.StringField({label: "EH.Ability.Label[one]"}),
				proficiency: new foundry.data.fields.SchemaField({
					multiplier: new foundry.data.fields.NumberField({
						nullable: false, initial: 0, min: 0, max: 2, step: 0.5, label: "EH.Proficiency.Multiplier"
					}),
					rounding: new foundry.data.fields.StringField({
						initial: "down", choices: ["down", "up"], label: "EH.Proficiency.Rounding"
					})
				}, {label: "EH.Proficiency.Label[one]"}),
				bonuses: new foundry.data.fields.SchemaField({
					check: new FormulaField({label: "EH.Skill.Bonuses.Check"}),
					passive: new FormulaField({deterministic: true, label: "EH.Skill.Bonuses.Passive"})
				})
			}), {
				initialKeys: CONFIG.EverydayHeroes.skills, initialValue: this._initialSkillValue,
				prepareKeys: true, label: "EH.Skill.Label[other]"
			}),
			traits: new foundry.data.fields.SchemaField({
				languages: new foundry.data.fields.SetField(new foundry.data.fields.StringField(), {label: ""}),
				equipment: new foundry.data.fields.SetField(new foundry.data.fields.StringField(), {label: ""})
			})
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Populate the proper initial abilities for the skills.
	 * @param {string} key - Key for which the initial data will be created.
	 * @param {object} initial - The initial skill object.
	 * @returns {object} - Initial skills object with the ability defined.
	 * @internal
	 */
	static _initialSkillValue(key, initial) {
		initial.ability = CONFIG.EverydayHeroes.skills[key]?.ability ?? initial.ability;
		return initial;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareBaseData() {
		this.attributes.hd.max = this.details.level;
		this.attributes.prof = Proficiency.calculateMod(this.details.level);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedAbilities() {
		const rollData = this.parent.getRollData();
		const globalDCBonus = simplifyBonus(this.bonuses.ability?.dc, rollData);
		const globalCheckBonus = simplifyBonus(this.bonuses.ability?.check, rollData);
		const globalSaveBonus = simplifyBonus(this.bonuses.ability?.save, rollData);
		for ( const ability of Object.values(this.abilities) ) {
			ability.mod = Math.floor((ability.value - 10) / 2);

			// TODO: Add jack of all trades
			ability.checkProficiency = new Proficiency(this.attributes.prof);
			ability.saveProficiency = new Proficiency(this.attributes.prof, ability.saveProficiency.multiplier);

			ability.checkBonus = globalCheckBonus + simplifyBonus(ability.bonuses.check, rollData);
			ability.check = ability.mod + ability.checkProficiency.flat + ability.checkBonus;
			ability.saveBonus = globalSaveBonus + simplifyBonus(ability.bonuses.save, rollData);
			ability.save = ability.mod + ability.saveProficiency.flat + ability.saveBonus;
			ability.dcBonus = globalDCBonus + simplifyBonus(ability.bonuses.dc, rollData);
			ability.dc = 8 + ability.mod + this.attributes.prof + ability.dcBonus;
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedSkills() {
		const rollData = this.parent.getRollData();
		const globalCheckBonus = simplifyBonus(this.bonuses.ability.check, rollData)
			+ simplifyBonus(this.bonuses.skill.check, rollData);
		const globalPassiveBonus = simplifyBonus(this.bonuses.skill.passive, rollData);
		for ( const skill of Object.values(this.skills) ) {
			skill.proficiency = new Proficiency(
				this.attributes.prof, skill.proficiency.multiplier, skill.proficiency.rounding
			);
			// TODO: Add jack of all trades

			const ability = this.abilities[skill.ability];
			skill.bonus = globalCheckBonus + simplifyBonus(ability?.bonuses.check, rollData)
				+ simplifyBonus(skill.bonuses.check, rollData);
			skill.mod = (ability?.mod ?? 0) + skill.bonus + skill.proficiency.flat;
			skill.passive = 10 + skill.mod + globalPassiveBonus + simplifyBonus(skill.bonuses.passive, rollData);
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedDetails() {
		for ( const item of this.parent.items ) {
			// TODO: Add actor warning if more than one archetype, class, background, or profession exist
			switch (item.type) {
				case "archetype":
					this.details.archetype = item;
					break;
				case "class":
					this.details.class = item;
					break;
				case "background":
					this.details.background = item;
					break;
				case "profession":
					this.details.profession = item;
					break;
			}
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedDefense() {
		const defense = this.details.archetype?.system.defense;
		this.attributes.defense ??= {};

		const highestAbility = { key: undefined, mod: -Infinity };
		for ( const abilityKey of (defense?.abilities ?? []) ) {
			const ability = this.abilities[abilityKey];
			if ( !ability || ability.mod <= highestAbility.mod ) continue;
			highestAbility.key = abilityKey;
			highestAbility.mod = ability.mod;
		}
		if ( !highestAbility.key ) {
			highestAbility.key = CONFIG.EverydayHeroes.defaultAbilities.defense;
			highestAbility.mod = this.abilities[CONFIG.EverydayHeroes.defaultAbilities.defense]?.mod ?? 0;
		}
		// TODO: Add global defense bonus

		this.attributes.defense.ability = highestAbility.key;
		this.attributes.defense.bonus = defense?.bonus ?? 0;
		this.attributes.defense.value = 10 + highestAbility.mod + this.attributes.defense.bonus;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedHitDice() {
		const hd = this.attributes.hd;
		hd.available = Math.clamped(0, hd.max - hd.spent, hd.max);
		hd.denomination = this.details.archetype?.system.hitDie;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedHitPoints() {
		const rollData = this.parent.getRollData();
		const hp = this.attributes.hp;
		const abilityId = CONFIG.EverydayHeroes.defaultAbilities.hitPoints ?? "con";
		const abilityMod = this.abilities[abilityId]?.mod ?? 0;
		const base = this.details.archetype?.system.advancement.byType("HitPoints")[0]?.getAdjustedTotal(abilityMod) ?? 0;
		const levelBonus = simplifyBonus(hp.bonuses.level, rollData) * this.details.level;
		const overallBonus = simplifyBonus(hp.bonuses.overall, rollData);
		hp.max = base + levelBonus + overallBonus;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedInitiative() {
		const rollData = this.parent.getRollData();
		const init = this.attributes.initiative;
		const abilityKey = init.ability ?? CONFIG.EverydayHeroes.defaultAbilities.initiative;
		const ability = this.abilities[abilityKey] ?? {};
		init.prof = new Proficiency(this.attributes.proficiency, 0);
		const initBonus = simplifyBonus(init.bonus, rollData);
		const abilityBonus = simplifyBonus(ability.bonuses?.check, rollData);
		const globalBonus = simplifyBonus(this.bonuses.ability.check, rollData);
		init.mod = (ability.mod ?? 0) + initBonus + abilityBonus + globalBonus;
	}
}
