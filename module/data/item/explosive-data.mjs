import SystemDataModel from "../abstract/system-data-model.mjs";
import FormulaField from "../fields/formula-field.mjs";
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
 * @property {number} dc - Override of default DC to avoid explosion's damage.
 * @property {object} radius
 * @property {number} radius.value - Radius of the explosive's damage area.
 * @property {string} radius.units - Units the radius is expressed in.
 * @property {object} bonuses
 * @property {string} bonuses.damage - Bonus to the explosive's damage.
 * @property {string} bonuses.dc - Bonus to the explosive's DC.
 */
export default class ExplosiveData extends SystemDataModel.mixin(DamageTemplate, DescribedTemplate, PhysicalTemplate) {
	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			type: new foundry.data.fields.SchemaField({
				category: new foundry.data.fields.StringField({intial: "basic", label: "EH.Equipment.Category.Label[one]"})
			}, {label: "EH.Equipment.Type.Label"}),
			properties: new foundry.data.fields.SetField(new foundry.data.fields.StringField(), {
				label: "EH.Weapon.Properties.Label"
			}),
			penetrationValue: new foundry.data.fields.NumberField({
				min: 0, integer: true,
				label: "EH.Equipment.Traits.PenetrationValue.Label", hint: "EH.Equipment.Traits.PenetrationValue.Hint"
			}),
			dc: new foundry.data.fields.NumberField({min: 0, integer: true, label: "EH.Weapon.DC.Label"}),
			radius: new foundry.data.fields.SchemaField({
				value: new foundry.data.fields.NumberField({min: 0, step: 0.1, label: ""}),
				units: new foundry.data.fields.StringField({label: "EH.Measurement.Units"})
				// TODO: Set default based on default units setting
			}),
			bonuses: new foundry.data.fields.SchemaField({
				damage: new FormulaField({label: "EH.Weapon.Bonuses.Damage.Label"}),
				dc: new FormulaField({label: "EH.Weapon.Bonuses.DC.Label"})
			})
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedTypeLabel() {
		this.type.label = game.i18n.format("EH.Equipment.Type.DetailedLabel", {
			category: CONFIG.EverydayHeroes.equipmentCategories[this.type.category]?.label ?? "",
			type: game.i18n.localize("EH.Item.Types.Explosive[one]"),
			subtype: ""
		});
	}
}
