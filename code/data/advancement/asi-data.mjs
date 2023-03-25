/**
 * Configuration data for the Ability Score Improvement advancement type.
 *
 * @property {Set<string>} fixed - Abilities that automatically get a +1.
 * @property {number} points - Number of points that can be assigned to the specified scores.
 * @property {Set<string>} choices - Abilities to which the player can choose to assign points.
 */
export class ASIConfigurationData extends foundry.abstract.DataModel {
	static defineSchema() {
		return {
			fixed: new foundry.data.fields.SetField(new foundry.data.fields.StringField(), {
				label: "EH.Advancement.ASI.Fixed.Label", hint: "EH.Advancement.ASI.Fixed.Hint"
			}),
			points: new foundry.data.fields.NumberField({
				integer: true, min: 0, initial: 0, label: "EH.Advancement.ASI.Points.Label"
			}),
			choices: new foundry.data.fields.SetField(new foundry.data.fields.StringField(), {
				label: "EH.Advancement.ASI.Choices.Label", hint: "EH.Advancement.ASI.Choices.Hint"
			})
		};
	}
}

/**
 * Value data for the Ability Score Improvement advancement type.
 *
 * @property {Set<string>} - Abilities that received a +1.
 */
export class ASIValueData extends foundry.abstract.DataModel {
	static defineSchema() {
		return {
			assignments: new foundry.data.fields.SetField(new foundry.data.fields.StringField(), {
				required: false, initial: undefined
			})
		};
	}
}
