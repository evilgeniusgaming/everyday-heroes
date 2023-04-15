import SystemDataModel from "../abstract/system-data-model.mjs";
import MappingField from "../fields/mapping-field.mjs";

/**
 * Data definition for Vehicle actors.
 */
export default class VehicleData extends SystemDataModel {

	static metadata = {
		type: "vehicle",
		localization: "EH.Actor.Type.Vehicle"
	};

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			abilities: new MappingField(new foundry.data.fields.SchemaField({
				mod: new foundry.data.fields.NumberField({
					nullable: false, initial: 0, integer: true, label: "EH.Ability.Modifier"
				})
			}), {initialKeys: ["str", "dex", "con"], prepareKeys: true, label: "EH.Ability.Label[other]"}),
			// TODO: Store vehicle initial keys in config
			armorValue: new foundry.data.fields.NumberField({
				initial: 0, min: 0, integer: true,
				label: "EH.Equipment.Trait.ArmorValue.Label", hint: "EH.Vehicle.Trait.ArmorValue.Hint"
			}),
			biography: new foundry.data.fields.SchemaField({
				value: new foundry.data.fields.HTMLField({label: "EH.Biography.Label"}),
				public: new foundry.data.fields.HTMLField({label: "EH.Biography.Public"})
			}, {label: "EH.Biography.Label"}),
			conditions: new MappingField(new foundry.data.fields.NumberField({
				min: 0, integer: true
			}), {label: "EH.Condition.Label[other]"}),
			passengers: new foundry.data.fields.SchemaField({
				min: new foundry.data.fields.NumberField({min: 0, integer: true}),
				max: new foundry.data.fields.NumberField({min: 0, integer: true})
			}, {label: "EH.Vehicle.Trait.Passengers.Label", hint: "EH.Vehicle.Trait.Passengers.Hint"}),
			price: new foundry.data.fields.NumberField({
				required: true, nullable: false, initial: 0, min: 0, integer: true,
				label: "EH.Equipment.Trait.PriceLevel.Label", hint: "EH.Equipment.Trait.PriceLevel.Hint"
			}),
			properties: new foundry.data.fields.SetField(new foundry.data.fields.StringField(), {
				label: "EH.Weapon.Property.Label"
			}),
			speed: new foundry.data.fields.SchemaField({
				min: new foundry.data.fields.NumberField({min: 0, integer: true}),
				max: new foundry.data.fields.NumberField({min: 0, integer: true}),
				units: new foundry.data.fields.StringField({initial: "miles-per-hour", label: ""})
			}, {label: "EH.Vehicle.Trait.TopSpeed.Label"})
		});
	}
}
