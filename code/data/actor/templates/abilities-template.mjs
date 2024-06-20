import FormulaField from "../../fields/formula-field.mjs";
import MappingField from "../../fields/mapping-field.mjs";
import { simplifyBonus } from "../../../utils.mjs";
import Proficiency from "../../../documents/proficiency.mjs";

/**
 * Data for an ability.
 *
 * @typedef {object} AbilityData
 * @property {Proficiency} saveProficiency - Proficiency in this skill's saving throws.
 * @property {object} alternates
 * @property {Set<string>} all - Alternate abilities available for any skill in which this ability is default.
 * @property {Set<string>} proficient - Alternate abilities available for skills in which the actor is proficient.
 * @property {object} bonuses
 * @property {string} bonuses.check - Bonus to checks with this ability.
 * @property {string} bonuses.dc - Bonus to this ability's DC.
 * @property {string} bonuses.save - Bonus to saves with this ability.
 * @property {string} minimums
 * @property {string} minimums.check - Minimum Challenge Die value for checks made with this ability.
 * @property {string} minimums.save - Minimum Challenge Die value for saves made with this ability.
 */

/**
 * Data model template for actors that have ability scores.
 * @mixin
 *
 * @property {Object<string, AbilityData>} abilities - Ability scores.
 * @property {object} bonuses
 * @property {object} bonuses.ability
 * @property {string} bonuses.ability.check - Global ability check bonus.
 * @property {string} bonuses.ability.dc - Global ability DC bonus.
 * @property {string} bonuses.ability.save - Global ability save bonus.
 * @property {object} overrides
 * @property {object} overrides.ability
 * @property {string} overrides.ability.minimums
 * @property {string} overrides.ability.minimums.check - Global minimum Challenge Die value for ability checks.
 * @property {string} overrides.ability.minimums.save - Global minimum Challenge Die value for ability saves.
 * @property {string} overrides.ability.checkProficiency.multiplier - Minimum prof multiplier for ability checks.
 * @property {string} overrides.ability.checkProficiency.rounding - Default prof rounding for ability checks.
 * @property {string} overrides.ability.saveProficiency.multiplier - Minimum prof multiplier for ability saves.
 * @property {string} overrides.ability.saveProficiency.rounding - Default prof rounding for ability saves.
 */
export default class AbilitiesTemplate extends foundry.abstract.DataModel {
	static defineSchema() {
		return {
			abilities: new MappingField(new foundry.data.fields.SchemaField({
				value: new foundry.data.fields.NumberField({
					min: 0, integer: true, label: "EH.Ability.Score[one]"
				}),
				max: new foundry.data.fields.NumberField({
					integer: true, min: 0, initial: 20, label: "EH.Ability.Max.Label", hint: "EH.Ability.Max.Hint"
				}),
				saveProficiency: new foundry.data.fields.SchemaField({
					multiplier: new foundry.data.fields.NumberField({
						nullable: false, initial: 0, min: 0, max: 2, step: 0.5, label: "EH.Proficiency.Multiplier"
					})
				}, {label: "EH.Proficiency.Label[one]"}),
				alternates: new foundry.data.fields.SchemaField({
					all: new foundry.data.fields.SetField(new foundry.data.fields.StringField({
						suggestions: CONFIG.EverydayHeroes.abilities
					}), {
						label: "EH.Ability.Alternate.All.Label", hint: "EH.Ability.Alternate.All.Hint"
					}),
					proficient: new foundry.data.fields.SetField(new foundry.data.fields.StringField({
						suggestions: CONFIG.EverydayHeroes.abilities
					}), {
						label: "EH.Ability.Alternate.Proficient.Label", hint: "EH.Ability.Alternate.Proficient.Hint"
					})
				}, {label: "EH.Ability.Alternate.Label"}),
				bonuses: new foundry.data.fields.SchemaField({
					check: new FormulaField({label: "EH.Ability.Bonus.Check.Label", hint: "EH.Ability.Bonus.Check.SpecificHint"}),
					dc: new FormulaField({label: "EH.Ability.Bonus.DC.Label", hint: "EH.Ability.Bonus.DC.SpecificHint"}),
					save: new FormulaField({label: "EH.Ability.Bonus.Save.Label", hint: "EH.Ability.Bonus.Save.SpecificHint"})
				}),
				minimums: new foundry.data.fields.SchemaField({
					check: new FormulaField({
						deterministic: true, label: "EH.Ability.Override.Minimum.Check.Label",
						hint: "EH.Ability.Override.Minimum.Check.SpecificHint"
					}),
					save: new FormulaField({
						deterministic: true, label: "EH.Ability.Override.Minimum.Save.Label",
						hint: "EH.Ability.Override.Minimum.Save.SpecificHint"
					})
				})
			}), {
				initialKeys: CONFIG.EverydayHeroes.abilities, prepareKeys: true, label: "EH.Ability.Label[other]"
			}),
			bonuses: new foundry.data.fields.SchemaField({
				ability: new foundry.data.fields.SchemaField({
					check: new FormulaField({label: "EH.Ability.Bonus.Check.Label", hint: "EH.Ability.Bonus.Check.GlobalHint"}),
					dc: new FormulaField({label: "EH.Ability.Bonus.DC.Label", hint: "EH.Ability.Bonus.DC.GlobalHint"}),
					save: new FormulaField({label: "EH.Ability.Bonus.Save.Label", hint: "EH.Ability.Bonus.Save.GlobalHint"})
				})
			}, {label: "EH.Bonus.Global.Label[other]"}),
			overrides: new foundry.data.fields.SchemaField({
				ability: new foundry.data.fields.SchemaField({
					minimums: new foundry.data.fields.SchemaField({
						check: new FormulaField({
							determinstic: true, label: "EH.Ability.Override.Minimum.Check.Label",
							hint: "EH.Ability.Override.Minimum.Check.GlobalHint"
						}),
						save: new FormulaField({
							determinstic: true, label: "EH.Ability.Override.Minimum.Save.Label",
							hint: "EH.Ability.Override.Minimum.Save.GlobalHint"
						})
					}),
					checkProficiency: new foundry.data.fields.SchemaField({
						multiplier: new foundry.data.fields.NumberField({
							nullable: true, initial: null, min: 0.5, max: 2, step: 0.5, label: "EH.Proficiency.Multiplier"
						}),
						rounding: new foundry.data.fields.StringField({
							nullable: true, initial: null, choices: ["down", "up"], label: "EH.Proficiency.Rounding"
						})
					}, {
						label: "EH.Ability.Override.Minimum.CheckProficiency.Label",
						hint: "EH.Ability.Override.Minimum.CheckProficiency.Hint"
					}),
					saveProficiency: new foundry.data.fields.SchemaField({
						multiplier: new foundry.data.fields.NumberField({
							nullable: true, initial: null, min: 0.5, max: 1, integer: true, label: "EH.Proficiency.Multiplier"
						}),
						rounding: new foundry.data.fields.StringField({
							nullable: true, initial: null, choices: ["down", "up"], label: "EH.Proficiency.Rounding"
						})
					}, {
						label: "EH.Ability.Override.Minimum.SaveProficiency.Label",
						hint: "EH.Ability.Override.Minimum.SaveProficiency.Hint"
					})
				})
			}, {label: "EH.Override.Label"})
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedAbilities() {
		const rollData = this.parent.getRollData();
		const prof = this.attributes?.prof ?? 0;
		const globalDCBonus = simplifyBonus(this.bonuses.ability.dc, rollData);
		const globalCheckBonus = simplifyBonus(this.bonuses.ability.check, rollData);
		const globalSaveBonus = simplifyBonus(this.bonuses.ability.save, rollData);
		for ( const [key, ability] of Object.entries(this.abilities) ) {
			ability.valid = ability.value !== null;
			ability._source = this._source.abilities?.[key] ?? {};
			ability.mod = ability.valid ? Math.floor((ability.value - 10) / 2) : 0;

			ability.checkProficiency = new Proficiency(
				prof,
				this.overrides.ability.checkProficiency.multiplier ?? 0,
				this.overrides.ability.checkProficiency.rounding
			);
			ability.saveProficiency = new Proficiency(
				prof,
				Math.max(this.overrides.ability.saveProficiency.multiplier ?? 0, ability.saveProficiency.multiplier),
				this.overrides.ability.saveProficiency.rounding
			);

			ability.checkBonus = globalCheckBonus + simplifyBonus(ability.bonuses.check, rollData);
			ability.check = ability.mod + ability.checkProficiency.flat + ability.checkBonus;
			ability.saveBonus = globalSaveBonus + simplifyBonus(ability.bonuses.save, rollData);
			ability.save = ability.mod + ability.saveProficiency.flat + ability.saveBonus;
			ability.dcBonus = globalDCBonus + simplifyBonus(ability.bonuses.dc, rollData);
			ability.dc = 8 + ability.mod + prof + ability.dcBonus;
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Helpers                                  */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Choose the ability with the highest modifier from the provided set.
	 * @param {Set<string>} [choices] - Abilities to consider in the comparison. If no set if provided, then the best
	 *                                  of all of the actor's abilities will be chosen.
	 * @returns {string|undefined}
	 */
	bestAbility(choices) {
		choices ??= new Set(Object.values(CONFIG.EverydayHeroes.abilities));

		const highestAbility = { key: undefined, mod: -Infinity };
		for ( const key of choices ) {
			const ability = this.abilities[key];
			if ( !ability || ability.mod <= highestAbility.mod ) continue;
			highestAbility.key = key;
			highestAbility.mod = ability.mod;
		}

		return highestAbility.key;
	}
}
