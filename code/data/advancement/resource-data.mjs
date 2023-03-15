import FormulaField from "../fields/formula-field.mjs";
import MappingField from "../fields/mapping-field.mjs";
import TypeField from "../fields/type-field.mjs";
import { ScaleValueConfigurationData, TYPES } from "./scale-value-data.mjs";

/**
 * Configuration data for the Resource advancement type.
 *
 * @property {object} recovery
 * @property {string} recovery.period - Period over which the resource recovers.
 * @property {string} recovery.formula - Formula used when recovering this resource. Blank means all uses are recovered.
 * @property {string} type - Type of data represented by this scale value.
 * @property {Object<string, *>} scale - Scale values for each level.
 */
export class ResourceConfigurationData extends ScaleValueConfigurationData {
	static defineSchema() {
		return {
			recovery: new foundry.data.fields.SchemaField({
				period: new foundry.data.fields.StringField({label: ""}),
				formula: new FormulaField({label: ""})
			}),
			type: new foundry.data.fields.StringField({
				required: true, initial: "string", choices: TYPES, label: "EH.Advancement.ScaleValue.Type.Label"
			}),
			scale: new MappingField(new TypeField({
				determineType: (_, parent) => parent?.type, modelLookup: type => TYPES[type]
			}), {required: true, label: "EH.Advancement.ScaleValue.Values.Label"})
		};
	}
}
