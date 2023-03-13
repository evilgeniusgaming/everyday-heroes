import SystemDataModel from "../abstract/system-data-model.mjs";
import FormulaField from "../fields/formula-field.mjs";
import DescribedTemplate from "./templates/described-template.mjs";
import EquipmentTemplate from "./templates/equipment-template.mjs";
import PhysicalTemplate from "./templates/physical-template.mjs";

/**
 * Data definition for Armor items.
 * @mixes {@link DescribedTemplate}
 * @mixes {@link EquipmentTemplate}
 * @mixes {@link PhysicalTemplate}
 *
 * @property {object} type
 * @property {string} type.value - Whether this item is armor or a shield.
 * @property {string} type.category - Equipment category of this item.
 * @property {Set<string>} properties - Armor's properties.
 * @property {number} armorValue - How well does this armor prevent damage?
 * @property {boolean} damaged - Is this armor in a damaged state?
 * @property {object} bonuses
 * @property {string} bonuses.save - Bonus applied to this armor's saving throws.
 */
export default class ArmorData extends SystemDataModel.mixin(DescribedTemplate, EquipmentTemplate, PhysicalTemplate) {
	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			type: new foundry.data.fields.SchemaField({
				value: new foundry.data.fields.StringField({intial: "armor", label: "EH.Armor.Type.Label"}),
				category: new foundry.data.fields.StringField({intial: "basic", label: "EH.Equipment.Category.Label[one]"})
			}, {label: "EH.Item.Type.Label"}),
			properties: new foundry.data.fields.SetField(new foundry.data.fields.StringField(), {
				label: "EH.Weapon.Property.Label"
			}),
			armorValue: new foundry.data.fields.NumberField({
				initial: 0, min: 0, integer: true,
				label: "EH.Equipment.Trait.ArmorValue.Label", hint: "EH.Equipment.Trait.ArmorValue.Hint"
			}),
			damaged: new foundry.data.fields.BooleanField({label: "EH.Armor.Damaged"}),
			bonuses: new foundry.data.fields.SchemaField({
				save: new FormulaField({label: "EH.Armor.Bonuses.Save.Label"})
			})
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get actions() {
		return [{
			label: EverydayHeroes.utils.numberFormat(this.armorSaveMod, { sign: true }),
			icon: "systems/everyday-heroes/artwork/svg/action/armor-save.svg",
			tooltip: game.i18n.format("EH.Action.Roll", {type: game.i18n.localize("EH.Armor.Action.Save.Label")}),
			data: { type: "armor-save", disadvantage: this.damaged }
		}];
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * The simplified armor save modifier for this item.
	 * @type {number}
	 */
	get armorSaveMod() {
		// TODO: Take flat bonuses into account
		return Number.isNumeric(this.proficiency?.term) ? this.proficiency.flat : 0;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get chatTags() {
		return [
			{ label: this.type.label, class: "type" },
			{
				label: `${game.i18n.localize(
					"EH.Equipment.Trait.ArmorValue.Abbreviation")} ${EverydayHeroes.utils.numberFormat(this.armorValue)}`,
				class: "property"
			},
			...this.propertiesTags,
			...this.physicalTags,
			{ label: game.i18n.localize("EH.Armor.Damaged"), class: "negative status", hidden: !this.damaged }
		];
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Can armor saving throws be performed by this item?
	 * @type {boolean}
	 */
	get hasArmorSave() {
		return true;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedTypeLabel() {
		this.type.label = game.i18n.format("EH.Item.Type.DetailedLabel", {
			category: CONFIG.EverydayHeroes.equipmentCategories[this.type.category]?.label ?? "",
			type: "",
			subtype: CONFIG.EverydayHeroes.armorTypes[this.type.value]?.label ?? ""
		}).trim();
	}
}
