import FormulaField from "../../fields/formula-field.mjs";
import MappingField from "../../fields/mapping-field.mjs";
import { simplifyBonus } from "../../../utils.mjs";
import Proficiency from "../../../documents/proficiency.mjs";

/**
 * Data for a skill.
 *
 * @typedef {object} SkillData
 * @property {Set<string>} abilities - Abilities that can be used when rolling this skill in addition to the one
 *                                     defined in the skill config. The highest will be rolled.
 * @property {Proficiency} proficiency - Proficiency in this skill.
 * @property {object} bonuses
 * @property {string} bonuses.check - Bonus to checks with this skill.
 * @property {string} bonuses.passive - Bonus to this skill's passive score.
 * @property {string} minimum - Minimum Challenge Die value for this skill.
 */

/**
 * Data model template for actors that have skills.
 * @mixin
 *
 * @property {object} bonuses
 * @property {object} bonuses.skill
 * @property {string} bonuses.skill.check - Global skill check bonus.
 * @property {string} bonuses.skill.passive - Global passive skill bonus.
 * @property {object} overrides
 * @property {object} overrides.skill
 * @property {string} overrides.skill.minimum - Global minimum Challenge Die value for skills.
 * @property {string} overrides.skill.proficiency.multiplier - Minimum proficiency multiplier for skills.
 * @property {string} overrides.skill.proficiency.rounding - Default proficiency rounding for skills.
 * @property {Object<string, SkillData>} skills - Actor's skills.
 */
export default class SkillsTemplate extends foundry.abstract.DataModel {
	static defineSchema() {
		return {
			bonuses: new foundry.data.fields.SchemaField({
				skill: new foundry.data.fields.SchemaField({
					check: new FormulaField({label: "EH.Skill.Bonus.Check.Label", hint: "EH.Skill.Bonus.Check.GlobalHint"}),
					passive: new FormulaField({
						deterministic: true, label: "EH.Skill.Bonus.Passive.Label", hint: "EH.Skill.Bonus.Passive.GlobalHint"
					})
				})
			}, {label: "EH.Bonus.Global.Label[other]"}),
			overrides: new foundry.data.fields.SchemaField({
				skill: new foundry.data.fields.SchemaField({
					minimum: new FormulaField({
						determinstic: true, label: "EH.Skill.Override.Minimum.Label", hint: "EH.Skill.Override.Minimum.GlobalHint"
					}),
					proficiency: new foundry.data.fields.SchemaField({
						multiplier: new foundry.data.fields.NumberField({
							nullable: true, initial: null, min: 0.5, max: 2, step: 0.5, label: "EH.Proficiency.Multiplier"
						}),
						rounding: new foundry.data.fields.StringField({
							nullable: true, initial: null, choices: ["down", "up"], label: "EH.Proficiency.Rounding"
						})
					}, {label: "EH.Skill.Override.Minimum.Proficiency.Label", hint: "EH.Skill.Override.Minimum.Proficiency.Hint"})
				}, {label: "EH.Skill.Label[other]"})
			}, {label: "EH.Override.Label"}),
			skills: new MappingField(new foundry.data.fields.SchemaField({
				abilities: new foundry.data.fields.SetField(new foundry.data.fields.StringField({
					suggestions: CONFIG.EverydayHeroes.abilities
				}), {
					label: "EH.Skill.Abilities.Label", hint: "EH.Skill.Abilities.Hint"
				}),
				proficiency: new foundry.data.fields.SchemaField({
					multiplier: new foundry.data.fields.NumberField({
						nullable: false, initial: 0, min: 0, max: 2, step: 0.5, label: "EH.Proficiency.Multiplier"
					})
				}, {label: "EH.Skill.Proficiency.Label[one]"}),
				bonuses: new foundry.data.fields.SchemaField({
					check: new FormulaField({label: "EH.Skill.Bonus.Check.Label", hint: "EH.Skill.Bonus.Check.SpecificHint"}),
					passive: new FormulaField({
						deterministic: true, label: "EH.Skill.Bonus.Passive.Label", hint: "EH.Skill.Bonus.Passive.SpecificHint"
					})
				}),
				minimum: new FormulaField({
					determinstic: true, label: "EH.Skill.Override.Minimum.Label", hint: "EH.Skill.Override.Minimum.SpecificHint"
				})
			}), {
				initialKeys: CONFIG.EverydayHeroes.skills, prepareKeys: true, label: "EH.Skill.Label[other]"
			})
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedSkills() {
		const rollData = this.parent.getRollData();
		const prof = this.attributes?.prof ?? 0;
		const globalCheckBonus = simplifyBonus(this.bonuses.ability?.check, rollData)
			+ simplifyBonus(this.bonuses.skill.check, rollData);
		const globalPassiveBonus = simplifyBonus(this.bonuses.skill.passive, rollData);
		for ( const [key, skill] of Object.entries(this.skills) ) {
			const config = CONFIG.EverydayHeroes.skills[key];

			skill._source = this._source.skills?.[key] ?? {};

			skill.abilities.add(config.ability);
			const defaultAbility = this.abilities?.[config.ability];
			if ( defaultAbility ) {
				defaultAbility.alternates.all.forEach(a => skill.abilities.add(a));
				if ( skill.proficiency.multiplier >= 1 ) {
					defaultAbility.alternates.proficient.forEach(a => skill.abilities.add(a));
				}
			}
			skill.ability ??= this.bestAbility(skill.abilities);

			skill.proficiency = new Proficiency(
				prof,
				Math.max(
					this.overrides.ability?.checkProficiency?.multiplier ?? 0,
					this.overrides.skill.proficiency.multiplier ?? 0,
					skill.proficiency.multiplier
				),
				this.overrides.skill.proficiency.rounding ?? this.overrides.ability.checkProficiency.rounding
			);

			const ability = this.abilities?.[skill.ability];
			skill.bonus = globalCheckBonus + simplifyBonus(ability?.bonuses.check, rollData)
				+ simplifyBonus(skill.bonuses.check, rollData);
			skill.mod = (ability?.mod ?? 0) + skill.bonus + skill.proficiency.flat;
			skill.passive = 10 + skill.mod + globalPassiveBonus + simplifyBonus(skill.bonuses.passive, rollData);
		}
	}
}
