import FormulaField from "../../fields/formula-field.mjs";

/**
 * Data model template for an item that can be activated.
 */
export default class ActivatableTemplate extends foundry.abstract.DataModel {
	static defineSchema() {
		return {
			activation: new foundry.data.fields.SchemaField({
				type: new foundry.data.fields.StringField({label: ""}),
				condition: new foundry.data.fields.StringField({label: ""})
			}, {label: ""}),
			consumption: new foundry.data.fields.SchemaField({
				amount: new foundry.data.fields.NumberField({label: ""}),
				target: new foundry.data.fields.StringField({label: ""}),
				type: new foundry.data.fields.StringField({label: ""})
			}, {label: ""}),
			uses: new foundry.data.fields.SchemaField({
				spent: new foundry.data.fields.NumberField({initial: 0, min: 0, integer: true, label: ""}),
				max: new FormulaField({deterministic: true, label: ""}),
				per: new foundry.data.fields.StringField({label: ""}),
				recovery: new FormulaField({label: ""})
			})
		};
	}
}
