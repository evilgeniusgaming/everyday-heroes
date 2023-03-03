import SystemDataModel from "../abstract/system-data-model.mjs";
import DescribedTemplate from "./templates/described-template.mjs";
import PhysicalTemplate from "./templates/physical-template.mjs";

/**
 * Data definition for Armor items.
 * @mixes {@link DescribedTemplate}
 * @mixes {@link PhysicalTemplate}
 *
 * @property {object} type
 * @property {string} type.value - Whether this item is armor or a shield.
 * @property {string} type.category - Equipment category of this item.
 * @property {Set<string>} properties - Armor's properties.
 * @property {number} armorValue - How well does this armor prevent damage?
 */
export default class ArmorData extends SystemDataModel.mixin(DescribedTemplate, PhysicalTemplate) {
	static defineSchema() {
		return {
			type: new foundry.data.fields.SchemaField({
				value: new foundry.data.fields.StringField({intial: "armor", label: "EH.Armor.Types.Label"}),
				category: new foundry.data.fields.StringField({intial: "basic", label: "EH.Equipment.Category.Label[one]"})
			}),
			properties: new foundry.data.fields.SetField(new foundry.data.fields.StringField(), {
				label: "EH.Weapon.Properties.Label"
			}),
			armorValue: new foundry.data.fields.NumberField({
				initial: 0, min: 0, integer: true,
				label: "EH.Equipment.Traits.ArmorValue.Label", hint: "EH.Equipment.Traits.ArmorValue.Hint"
			})
		};
	}
}
