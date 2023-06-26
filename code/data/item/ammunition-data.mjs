import ItemDataModel from "../abstract/item-data-model.mjs";
import FormulaField from "../fields/formula-field.mjs";
import MappingField from "../fields/mapping-field.mjs";
import DamageTemplate from "./templates/damage-template.mjs";
import DescribedTemplate from "./templates/described-template.mjs";
import EquipmentTemplate from "./templates/equipment-template.mjs";
import PhysicalTemplate from "./templates/physical-template.mjs";
import TypedTemplate from "./templates/typed-template.mjs";

/**
 * Data definition for Ammunition items.
 * @mixes {@link DamageTemplate}
 * @mixes {@link DescribedTemplate}
 * @mixes {@link EquipmentTemplate}
 * @mixes {@link PhysicalTemplate}
 * @mixes {@link TypedTemplate}
 *
 * @property {Object<string, number>} properties - Properties to add or remove from the weapon.
 * @property {number} penetrationValue - How does this ammo modify the weapon's penetration value?
 * @property {object} bonuses
 * @property {string} bonuses.attack - Bonus to the weapon's attack rolls.
 * @property {string} bonuses.damage - Bonus to the weapon's damage rolls.
 * @property {object} bonuses.critical
 * @property {string} bonuses.critical.damage - Extra critical damage.
 * @property {number} bonuses.critical.dice - Extra critical damage dice.
 * @property {object} overrides
 * @property {object} overrides.critical
 * @property {number} overrides.critical.threshold - Number needed to roll to score a critical hit with this ammo.
 */
export default class AmmunitionData extends ItemDataModel.mixin(
	DamageTemplate, DescribedTemplate, EquipmentTemplate, PhysicalTemplate, TypedTemplate
) {

	static get metadata() {
		return {
			type: "ammunition",
			category: "physical",
			localization: "EH.Item.Type.Ammunition",
			icon: "fa-solid fa-cubes-stacked",
			image: "systems/everyday-heroes/artwork/svg/items/ammunition.svg",
			advancement: {
				grantable: true
			}
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static damageMode = "modification";

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			properties: new MappingField(new foundry.data.fields.NumberField({min: -1, max: 1, integer: true}), {
				label: "EH.Weapon.Property.Label"
			}),
			penetrationValue: new foundry.data.fields.NumberField({
				integer: true,
				label: "EH.Equipment.Trait.PenetrationValue.Label", hint: ""
			}),
			bonuses: new foundry.data.fields.SchemaField({
				attack: new FormulaField({label: "EH.Weapon.Bonus.Attack.Label"}),
				damage: new FormulaField({label: "EH.Weapon.Bonus.Damage.Label"}),
				critical: new foundry.data.fields.SchemaField({
					damage: new FormulaField({
						label: "EH.Weapon.Bonus.Critical.Damage.Label", hint: "EH.Weapon.Bonus.Critical.Damage.Hint"
					}),
					dice: new foundry.data.fields.NumberField({
						label: "EH.Weapon.Bonus.Critical.Dice.Label", hint: "EH.Weapon.Bonus.Critical.Dice.Hint"
					})
				})
			}),
			overrides: new foundry.data.fields.SchemaField({
				critical: new foundry.data.fields.SchemaField({
					threshold: new foundry.data.fields.NumberField({label: "EH.Weapon.Overrides.Critical.Threshold.Label"})
				})
			})
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get damageAbility() {
		if ( this.overrides.ability.damage === "none" ) return null;
		return this.overrides.ability.damage || undefined;
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
