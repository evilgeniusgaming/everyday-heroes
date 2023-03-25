/**
 * Configuration data for the Trait advancement type.
 *
 * @property {string} type - Type of trait to modify (e.g. "asi", "save", "skill", "equipment", "language").
 * @property {boolean} expertise - For skill proficiency, is this instead granting expertise?
 * @property {Set<string>} fixed - Keys that get an automatic improvement.
 * @property {number} points - Number of choices that can be selected.
 * @property {Set<string>} choices - Keys that the player can choose from.
 */
export class TraitConfigurationData extends foundry.abstract.DataModel {
	static defineSchema() {
		return {
			type: new foundry.data.fields.StringField({blank: false, initial: "save", label: ""}),
			expertise: new foundry.data.fields.BooleanField({label: ""}),
			fixed: new foundry.data.fields.SetField(new foundry.data.fields.StringField(), {
				label: "EH.Advancement.Trait.Fixed.Label", hint: "EH.Advancement.Trait.Fixed.Hint"
			}),
			points: new foundry.data.fields.NumberField({
				integer: true, min: 0, initial: 0, label: "EH.Advancement.Trait.Points.Label"
			}),
			choices: new foundry.data.fields.SetField(new foundry.data.fields.StringField(), {
				label: "EH.Advancement.Trait.Choices.Label", hint: "EH.Advancement.Trait.Choices.Hint"
			})
		};
	}
}

/**
 * Value data for the Trait advancement type.
 *
 * @property {Set<string>} assignments - Traits that have been improved.
 */
export class TraitValueData extends foundry.abstract.DataModel {
	static defineSchema() {
		return {
			assignments: new foundry.data.fields.SetField(new foundry.data.fields.StringField(), {
				required: false, initial: undefined
			})
		};
	}
}
