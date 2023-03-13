import MappingField from "../fields/mapping-field.mjs";
import TypeField from "../fields/type-field.mjs";
import { ScaleValueConfigurationData, TYPES } from "./scale-value-data.mjs";

/**
 * Configuration data for the Defense advancement type.
 *
 * @property {string} abilities - Abilities that can be used when calculating defense value.
 * @property {Object<string, *>} scale - Scale values for each level.
 */
export class DefenseConfigurationData extends ScaleValueConfigurationData {
	static defineSchema() {
		return {
			abilities: new foundry.data.fields.SetField(new foundry.data.fields.StringField(), {
				label: "EH.Advancement.Defense.Abilities.Label", hint: "EH.Advancement.Defense.Abilities.Hint"
			}),
			scale: new MappingField(new TypeField({
				determineType: () => "number", modelLookup: type => TYPES[type]
			}), {required: true, label: "EH.Advancement.ScaleValue.Values.Label"})
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Defense is always a number type advancement.
	 * @type {string}
	 */
	get type() {
		return "number";
	}
}
