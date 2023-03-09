import SystemDataModel from "../abstract/system-data-model.mjs";
import FormulaField from "../fields/formula-field.mjs";
import DamageTemplate from "./templates/damage-template.mjs";
import DescribedTemplate from "./templates/described-template.mjs";
import PhysicalTemplate from "./templates/physical-template.mjs";

/**
 * Data definition for Ammunition items.
 * @mixes {@link DamageTemplate}
 * @mixes {@link DescribedTemplate}
 * @mixes {@link PhysicalTemplate}
 *
 * @property {object} type
 * @property {string} type.value - Ammunition type.
 * @property {number} penetrationValue - How does this ammo modify the weapon's penetration value?
 * @property {object} bonuses
 * @property {string} bonuses.damage - Bonus to the weapon's damage rolls.
 */
export default class AmmunitionData extends SystemDataModel.mixin(
	DamageTemplate, DescribedTemplate, PhysicalTemplate
) {

	static damageMode = "modification";

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			type: new foundry.data.fields.SchemaField({
				value: new foundry.data.fields.StringField({intial: "basic", label: "EH.Ammunition.Type.Label"})
			}, {label: "EH.Equipment.Type.Label"}),
			penetrationValue: new foundry.data.fields.NumberField({
				integer: true,
				label: "EH.Equipment.Trait.PenetrationValue.Label", hint: ""
			}),
			bonuses: new foundry.data.fields.SchemaField({
				damage: new FormulaField({label: "EH.Weapon.Bonus.Damage.Label"})
			})
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedTypeLabel() {
		this.type.label = game.i18n.format("EH.Equipment.Type.DetailedLabel", {
			category: "",
			type: game.i18n.localize("EH.Item.Type.Ammunition[one]"),
			subtype: CONFIG.EverydayHeroes.ammunitionTypes[this.type.value] ?? ""
		});
	}
}
