import SystemDataModel from "../abstract/system-data-model.mjs";
import FormulaField from "../fields/formula-field.mjs";
import MappingField from "../fields/mapping-field.mjs";
import DamageTemplate from "./templates/damage-template.mjs";
import DescribedTemplate from "./templates/described-template.mjs";
import EquipmentTemplate from "./templates/equipment-template.mjs";
import PhysicalTemplate from "./templates/physical-template.mjs";

/**
 * Data definition for Ammunition items.
 * @mixes {@link DamageTemplate}
 * @mixes {@link DescribedTemplate}
 * @mixes {@link EquipmentTemplate}
 * @mixes {@link PhysicalTemplate}
 *
 * @property {object} type
 * @property {string} type.value - Ammunition type.
 * @property {Object<string, number>} properties - Properties to add or remove from the weapon.
 * @property {number} penetrationValue - How does this ammo modify the weapon's penetration value?
 * @property {object} bonuses
 * @property {string} bonuses.attack - Bonus to the weapon's attack rolls.
 * @property {string} bonuses.damage - Bonus to the weapon's damage rolls.
 */
export default class AmmunitionData extends SystemDataModel.mixin(
	DamageTemplate, DescribedTemplate, EquipmentTemplate, PhysicalTemplate
) {

	static metadata = {
		type: "ammunition",
		category: "physical",
		localization: "EH.Item.Type.Ammunition",
		icon: "fa-solid fa-cubes-stacked",
		image: "systems/everyday-heroes/artwork/svg/items/ammunition.svg"
	};

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static damageMode = "modification";

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			type: new foundry.data.fields.SchemaField({
				value: new foundry.data.fields.StringField({intial: "basic", label: "EH.Ammunition.Type.Label"})
			}, {label: "EH.Item.Type.Label"}),
			properties: new MappingField(new foundry.data.fields.NumberField({min: -1, max: 1, integer: true}), {
				label: "EH.Weapon.Property.Label"
			}),
			penetrationValue: new foundry.data.fields.NumberField({
				integer: true,
				label: "EH.Equipment.Trait.PenetrationValue.Label", hint: ""
			}),
			bonuses: new foundry.data.fields.SchemaField({
				attack: new FormulaField({label: "EH.Weapon.Bonus.Attack.Label"}),
				damage: new FormulaField({label: "EH.Weapon.Bonus.Damage.Label"})
			})
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedTypeLabel() {
		this.type.label = game.i18n.format("EH.Item.Type.DetailedLabel", {
			category: "",
			type: game.i18n.localize("EH.Item.Type.Ammunition[one]"),
			subtype: CONFIG.EverydayHeroes.ammunitionTypes[this.type.value]?.label ?? ""
		}).trim();
	}
}
