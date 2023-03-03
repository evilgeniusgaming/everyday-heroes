import SystemDataModel from "../abstract/system-data-model.mjs";
import DamageTemplate from "./templates/damage-template.mjs";
import DescribedTemplate from "./templates/described-template.mjs";
import PhysicalTemplate from "./templates/physical-template.mjs";

/**
 * Data definition for Explosive items.
 * @mixes {@link DamageTemplate}
 * @mixes {@link DescribedTemplate}
 * @mixes {@link PhysicalTemplate}
 *
 * @property {object} type
 * @property {string} type.category - Equipment category of this item.
 * @property {Set<string>} properties - Explosive's properties.
 * @property {object} radius
 * @property {number} radius.value - Radius of the explosive's damage area.
 * @property {string} radius.units - Units the radius is expressed in.
 */
export default class ExplosiveData extends SystemDataModel.mixin(DamageTemplate, DescribedTemplate, PhysicalTemplate) {
	static defineSchema() {
		return {
			type: new foundry.data.fields.SchemaField({
				category: new foundry.data.fields.StringField({intial: "basic", label: "EH.Equipment.Category.Label[one]"})
			}),
			properties: new foundry.data.fields.SetField(new foundry.data.fields.StringField(), {
				label: "EH.Weapon.Properties.Label"
			}),
			dc: new foundry.data.fields.NumberField({min: 0, integer: true, label: ""}),
			radius: new foundry.data.fields.SchemaField({
				value: new foundry.data.fields.NumberField({min: 0, step: 0.1, label: ""}),
				units: new foundry.data.fields.StringField({label: ""})
				// TODO: Set default based on default units setting
			})
		};
	}
}
