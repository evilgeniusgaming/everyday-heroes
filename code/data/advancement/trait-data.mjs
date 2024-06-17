const { NumberField, SetField, StringField } = foundry.data.fields;

/**
 * Configuration data for the Trait advancement type.
 *
 * @property {string} type - Type of trait to modify (e.g. "asi", "save", "skill", "equipment").
 * @property {string} mode - Mode for proficiencies granted on skills (normal, expertise, upgrade).
 * @property {Set<string>} fixed - Keys that get an automatic improvement.
 * @property {number} points - Number of choices that can be selected.
 * @property {Set<string>} choices - Keys that the player can choose from.
 */
export class TraitConfigurationData extends foundry.abstract.DataModel {
	static defineSchema() {
		return {
			type: new StringField({blank: false, initial: "skill", label: ""}),
			mode: new StringField({ initial: "default", choices: CONFIG.EverydayHeroes.traitModes }),
			fixed: new SetField(new StringField(), {
				label: "EH.Advancement.Trait.Fixed.Label", hint: "EH.Advancement.Trait.Fixed.Hint"
			}),
			points: new NumberField({
				integer: true, min: 0, initial: 0, label: "EH.Advancement.Trait.Points.Label"
			}),
			choices: new SetField(new StringField(), {
				label: "EH.Advancement.Trait.Choices.Label", hint: "EH.Advancement.Trait.Choices.Hint"
			})
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Migration                           */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static migrateData(source) {
		if ( source.expertise === true ) source.mode = "expertise";
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
			assignments: new SetField(new StringField(), {required: false, initial: undefined})
		};
	}
}
