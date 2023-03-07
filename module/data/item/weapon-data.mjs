import SystemDataModel from "../abstract/system-data-model.mjs";
import FormulaField from "../fields/formula-field.mjs";
import AttackTemplate from "./templates/attack-template.mjs";
import DamageTemplate from "./templates/damage-template.mjs";
import DescribedTemplate from "./templates/described-template.mjs";
import PhysicalTemplate from "./templates/physical-template.mjs";

/**
 * Data definition for Weapon items.
 * @mixes {@link AttackTemplate}
 * @mixes {@link DamageTemplate}
 * @mixes {@link DescribedTemplate}
 * @mixes {@link PhysicalTemplate}
 *
 * @property {object} type
 * @property {string} type.value - Whether this is a melee or ranged weapon.
 * @property {string} type.category - Equipment category of this item.
 * @property {Set<string>} properties - Weapon's properties.
 * @property {number} penetrationValue - How armor piercing is this weapon?
 * @property {object} range
 * @property {number} range.short - Normal range for ranged or thrown weapons.
 * @property {number} range.long - Long range for ranged or thrown weapons.
 * @property {number} range.reach - Reach for melee weapons with the "Reach" property.
 * @property {string} range.units - Units represented by the range values.
 * @property {string} reload - Action type required to reload this weapon.
 * @property {object} rounds
 * @property {number} rounds.spend - Number of rounds that have been spend from the current magazine.
 * @property {number} rounds.capacity - Capacity of this weapon's magazine.
 * @property {number} rounds.burst - Number of rounds expended while taking burst shot.
 * @property {object} bonuses
 * @property {string} bonuses.attack - Bonus to the weapon's attack rolls.
 * @property {string} bonuses.damage - Bonus to the weapon's damage rolls.
 */
export default class WeaponData extends SystemDataModel.mixin(
	AttackTemplate, DamageTemplate, DescribedTemplate, PhysicalTemplate
) {
	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			type: new foundry.data.fields.SchemaField({
				value: new foundry.data.fields.StringField({initial: "melee", label: "EH.Weapon.Types.Label"}),
				category: new foundry.data.fields.StringField({intial: "basic", label: "EH.Equipment.Category.Label[one]"})
			}, {label: "EH.Equipment.Type.Label"}),
			properties: new foundry.data.fields.SetField(new foundry.data.fields.StringField(), {
				label: "EH.Weapon.Properties.Label"
			}),
			penetrationValue: new foundry.data.fields.NumberField({
				min: 0, integer: true,
				label: "EH.Equipment.Traits.PenetrationValue.Label", hint: "EH.Equipment.Traits.PenetrationValue.Hint"
			}),
			range: new foundry.data.fields.SchemaField({
				short: new foundry.data.fields.NumberField({min: 0, step: 0.1, label: "EH.Equipment.Traits.Range.Short"}),
				long: new foundry.data.fields.NumberField({min: 0, step: 0.1, label: "EH.Equipment.Traits.Range.Long"}),
				reach: new foundry.data.fields.NumberField({min: 0, step: 0.1, label: "EH.Equipment.Traits.Range.Reach"}),
				units: new foundry.data.fields.StringField({label: "EH.Measurement.Units"})
				// TODO: Set default based on default units setting
			}, {label: "EH.Equipment.Traits.Range.Label", hint: "EH.Equipment.Traits.Range.Hint"}),
			reload: new foundry.data.fields.StringField({
				label: "EH.Equipment.Traits.Reload.Label", hint: "EH.Equipment.Traits.Reload.Hint"
			}),
			rounds: new foundry.data.fields.SchemaField({
				spent: new foundry.data.fields.NumberField({
					initial: 0, min: 0, integer: true, label: "EH.Equipment.Traits.Rounds.Spent"
				}),
				capacity: new foundry.data.fields.NumberField({
					min: 0, integer: true, label: "EH.Equipment.Traits.Rounds.Capacity"
				}),
				burst: new foundry.data.fields.NumberField({min: 0, integer: true, label: "EH.Equipment.Traits.Rounds.Burst"})
			}, {label: "EH.Equipment.Traits.Rounds.Label", hint: "EH.Equipment.Traits.Rounds.Hint"}),
			bonuses: new foundry.data.fields.SchemaField({
				attack: new FormulaField({label: "EH.Weapon.Bonuses.Attack.Label"}),
				damage: new FormulaField({label: "EH.Weapon.Bonuses.Damage.Label"})
			})
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Getters                                  */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Build a list of roll actions for this item.
	 * @type {object[]}
	 */
	get rollActions() {
		// Attack
		//   Burst (if "burst" property)
		//   Offhand (if "light" property, or unarmed strike)
		//   Thrown (if melee with "thrown" property)
		// Damage
		//   Burst (if "burst" property)
		//   Offhand (if "light" property, or unarmed strike)
		return [
			{
				label: "+4", // TOOD: Add attack mod value
				tooltip: game.i18n.format("EH.Action.Roll", {type: game.i18n.localize("EH.Weapon.Action.AttackGeneric.Label")}),
				icon: `systems/everyday-heroes/artwork/svg/action/attack-${this.type.value === "ranged" ? "ranged" : "melee"}.svg`,
				data: {
					type: "attack"
				}
			},
			{
				label: "1d10 + 4", // TOOD: Add damage formula
				tooltip: game.i18n.format("EH.Action.Roll", {type: game.i18n.localize("EH.Weapon.Action.DamageGeneric.Label")}),
				icon: "systems/everyday-heroes/artwork/svg/action/damage.svg",
				data: {
					type: "damage"
				}
			}
		];
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Is range a relevant concept for this weapon?
	 * @type {boolean}
	 */
	get usesRange() {
		return (this.type.value === "ranged") || this.properties.has("thrown");
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Are rounds a relevant concept for this weapon?
	 * @type {boolean}
	 */
	get usesRounds() {
		return (this.type.value === "ranged");
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedTypeLabel() {
		this.type.label = game.i18n.format("EH.Equipment.Type.DetailedLabel", {
			category: CONFIG.EverydayHeroes.equipmentCategories[this.type.category]?.label ?? "",
			type: game.i18n.localize("EH.Item.Types.Weapon[one]"),
			subtype: CONFIG.EverydayHeroes.weaponTypes[this.type.value] ?? ""
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Helper Methods                           */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	attackAbility(type) {
		type ??= this.type.value;
		if ( type === "burst" ) type = "ranged";
		if ( type === "offhand" ) type = "melee";
		const def = CONFIG.EverydayHeroes.defaultAbilities;

		// Finesse, higher of dexterity or strength
		if ( this.properties.has("finesse") ) {
			const abilities = this.parent?.actor?.system.abilities;
			if ( !abilities ) return ["ranged", "thrown"].includes(type) ? def.ranged : def.melee;
			if ( abilities[def.ranged]?.mod > abilities[def.melee]?.mod ) return def.ranged;
			return def.melee;
		}

		return type === "ranged" ? def.ranged : def.melee;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	damageAbility(type) {
		if ( type === "offhand" ) return null;
		return this.attackAbility();
	}
}
