import SystemDataModel from "../abstract/system-data-model.mjs";
import FormulaField from "../fields/formula-field.mjs";
import Proficiency from "../../documents/proficiency.mjs";
import AbilitiesTemplate from "./templates/abilities-template.mjs";
import InitiativeTemplate from "./templates/initiative-template.mjs";
import MovementTemplate from "./templates/movement-template.mjs";
import SkillsTemplate from "./templates/skills-template.mjs";

/**
 * Data definition for NPC actors.
 * @mixes {@link AbilitiesTemplate}
 * @mixes {@link InitiativeTemplate}
 * @mixes {@link MovementTemplate}
 * @mixes {@link SkillsTemplate}
 */
export default class NPCData extends SystemDataModel.mixin(
	AbilitiesTemplate, InitiativeTemplate, MovementTemplate, SkillsTemplate
) {
	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			attributes: new foundry.data.fields.SchemaField({
				defense: new foundry.data.fields.NumberField({initial: 10, min: 0, integer: true, label: "EH.Defense.Label"}),
				hd: new foundry.data.fields.SchemaField({
					count: new foundry.data.fields.NumberField({label: ""}),
					denomination: new foundry.data.fields.NumberField({positive: true, integer: true, label: "EH.Dice.Denomination"}),
					spent: new foundry.data.fields.NumberField({initial: 0, min: 0, integer: true, label: "EH.HitDice.Spent"})
				}, {label: "EH.HitDice.Labe[other]"}),
				hp: new foundry.data.fields.SchemaField({
					value: new foundry.data.fields.NumberField({
						nullable: false, initial: 0, min: 0, integer: true, label: "EH.HitPoints.Current"
					}),
					max: new foundry.data.fields.NumberField({
						min: 0, integer: true, label: "EH.HitPoints.Max"
					}),
					temp: new foundry.data.fields.NumberField({
						initial: null, min: 0, integer: true, label: "EH.HitPoints.Temp"
					}),
					formula: new FormulaField({label: "EH.HitPoints.Formula"})
					// TODO: Determine if this would be better handed directly from the hit dice
				}, {label: "EH.HitPoints.Label[other]"})
			}, {label: ""}),
			biography: new foundry.data.fields.SchemaField({
				value: new foundry.data.fields.HTMLField({label: "EH.Biography.Label"}),
				public: new foundry.data.fields.HTMLField({label: "EH.Biography.Public"}),
				roles: new foundry.data.fields.ArrayField(new foundry.data.fields.StringField(), {label: "EH.Role.Label[other]"})
			}, {label: ""}),
			details: new foundry.data.fields.SchemaField({
				cr: new foundry.data.fields.NumberField({initial: 0, min: 0, label: "EH.ChallengeRating.Label"})
			}, {label: ""}),
			traits: new foundry.data.fields.SchemaField({
				size: new foundry.data.fields.StringField({initial: "medium", label: "EH.Size.Label"}),
				type: new foundry.data.fields.SchemaField({
					value: new foundry.data.fields.StringField({label: ""}),
					tags: new foundry.data.fields.ArrayField(new foundry.data.fields.StringField(), {label: ""})
				}, {label: ""})
			}, {label: ""})
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareBaseData() {
		this.attributes.prof = Proficiency.calculateMod(this.details.cr);
	}
}
