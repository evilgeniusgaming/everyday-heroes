import { numberFormat } from "../../utils.mjs";
import SystemDataModel from "../abstract/system-data-model.mjs";
import FormulaField from "../fields/formula-field.mjs";
import AttackTemplate from "./templates/attack-template.mjs";
import DamageTemplate from "./templates/damage-template.mjs";
import DescribedTemplate from "./templates/described-template.mjs";
import EquipmentTemplate from "./templates/equipment-template.mjs";
import PhysicalTemplate from "./templates/physical-template.mjs";
import TypedTemplate from "./templates/typed-template.mjs";

/**
 * Data definition for Explosive items.
 * @mixes {@link AttackTemplate}
 * @mixes {@link DamageTemplate}
 * @mixes {@link DescribedTemplate}
 * @mixes {@link EquipmentTemplate}
 * @mixes {@link PhysicalTemplate}
 * @mixes {@link TypedTemplate}
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
export default class ExplosiveData extends SystemDataModel.mixin(
	AttackTemplate, DamageTemplate, DescribedTemplate, EquipmentTemplate, PhysicalTemplate, TypedTemplate
) {

	static get metadata() {
		return {
			type: "explosive",
			category: "physical",
			localization: "EH.Item.Type.Explosive",
			icon: "fa-solid fa-burst",
			image: "systems/everyday-heroes/artwork/svg/items/explosive.svg"
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			type: new foundry.data.fields.SchemaField({
				category: new foundry.data.fields.StringField({intial: "basic", label: "EH.Equipment.Category.Label[one]"})
			}, {label: "EH.Item.Type.Label"}),
			properties: new foundry.data.fields.SetField(new foundry.data.fields.StringField(), {
				label: "EH.Weapon.Property.Label"
			}),
			penetrationValue: new foundry.data.fields.NumberField({
				min: 0, integer: true,
				label: "EH.Equipment.Trait.PenetrationValue.Label", hint: "EH.Equipment.Trait.PenetrationValue.Hint"
			}),
			dc: new foundry.data.fields.NumberField({min: 0, integer: true, label: "EH.Explosive.DC.Label"}),
			radius: new foundry.data.fields.SchemaField({
				value: new foundry.data.fields.NumberField({min: 0, step: 0.1, label: ""}),
				units: new foundry.data.fields.StringField({
					initial: () => CONFIG.EverydayHeroes.defaultUnits.length, label: "EH.Measurement.Units"
				})
			}),
			bonuses: new foundry.data.fields.SchemaField({
				damage: new FormulaField({label: "EH.Weapon.Bonus.Damage.Label"}),
				dc: new FormulaField({label: "EH.Weapon.Bonus.DC.Label"})
			})
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get attackAbility() {
		return this.rangedAbility;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get attackIcon() {
		return "systems/everyday-heroes/artwork/svg/action/attack-explosive.svg";
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get canCritical() {
		return false;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get chatTags() {
		const tags = [
			{ label: this.type.label, class: "type" },
			...this.propertiesTags,
			...(this._source.dc ? [{
				label: game.i18n.format("EH.DifficultyClass.Tag", {dc: this.dc}),
				class: "property"
			}] : []),
			...this.proficiencyTags,
			...this.physicalTags
		];
		if ( this.radius.value ) tags.splice(1, 0, {
			label: game.i18n.format("EH.Measurement.Radius.Tag", {
				size: numberFormat(this.radius.size, {unit: this.radius.units})
			}),
			class: "detail"
		});
		if ( this.hasDamage ) tags.splice(1, 0, {
			label: `${game.i18n.localize(
				"EH.Equipment.Trait.PenetrationValue.Abbreviation")} ${numberFormat(this.penetrationValue)}`,
			class: "detail"
		});
		return tags;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get damageIcon() {
		return "systems/everyday-heroes/artwork/svg/action/damage-explosive.svg";
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get hasDamageSave() {
		return true;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedTypeLabel() {
		this.type.label = game.i18n.format("EH.Item.Type.DetailedLabel", {
			category: CONFIG.EverydayHeroes.equipmentCategories[this.type.category]?.label ?? "",
			type: CONFIG.EverydayHeroes.explosiveTypes[this.type.value]?.label
				?? game.i18n.localize("EH.Item.Type.Explosive[one]"),
			subtype: ""
		}).trim();
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareFinalDC() {
		this.dc = this._source.dc || 8 + this.attackMod;
	}
}
