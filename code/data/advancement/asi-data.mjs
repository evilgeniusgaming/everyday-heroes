import MappingField from "../fields/mapping-field.mjs";

/**
 * Configuration data for the Ability Score Improvement advancement type.
 *
 * @property {Set<string>} locked - Abilities that cannot have points added to them.
 * @property {number} points - Number of points that can be assigned to any score.
 * @property {Object<string, number>} fixed - Number of points automatically assigned to a certain score.
 */
export class ASIConfigurationData extends foundry.abstract.DataModel {
	static defineSchema() {
		return {
			points: new foundry.data.fields.NumberField({
				integer: true, min: 0, initial: 0,
				label: "EH.Advancement.ASI.Points.Label", hint: "EH.Advancement.ASI.Points.Hint"
			}),
			locked: new foundry.data.fields.SetField(new foundry.data.fields.StringField()),
			fixed: new MappingField(
				new foundry.data.fields.NumberField({nullable: false, integer: true, initial: 0}),
				{label: "EH.Advancement.ASI.Fixed"}
			)
		};
	}
}

/**
 * Value data for the Ability Score Improvement advancement type.
 *
 * @property {Object<string, number>} - Points assigned to individual scores.
 */
export class ASIValueData extends foundry.abstract.DataModel {
	static defineSchema() {
		return {
			assignments: new MappingField(new foundry.data.fields.NumberField({
				nullable: false, integer: true
			}), {required: false, initial: undefined})
		};
	}
}
