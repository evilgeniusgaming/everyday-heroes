import MappingField from "../../fields/mapping-field.mjs";

/**
 * Data model template for actors that have movement.
 * @mixin
 */
export default class MovementTemplate extends foundry.abstract.DataModel {
	static defineSchema() {
		const speedConfig = { nullable: false, initial: 30, min: 0, step: 0.1 };
		return {
			attributes: new foundry.data.fields.SchemaField({
				movement: new foundry.data.fields.SchemaField({
					value: new foundry.data.fields.NumberField({
						...speedConfig, label: "EH.Speed.Label"
					}),
					special: new MappingField(new foundry.data.fields.NumberField({ ...speedConfig }), {label: ""}),
					units: new foundry.data.fields.StringField({initial: "ft", label: "EH.Measurement.Units"})
					// TODO: Set default based on default units setting
				})
			})
		};
	}
}
