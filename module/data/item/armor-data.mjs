import Proficiency from "../../documents/proficiency.mjs";
import SystemDataModel from "../abstract/system-data-model.mjs";
import FormulaField from "../fields/formula-field.mjs";
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
 * @property {boolean} damaged - Is this armor in a damaged state?
 * @property {object} bonuses
 * @property {string} bonuses.save - Bonus applied to this armor's saving throws.
 */
export default class ArmorData extends SystemDataModel.mixin(DescribedTemplate, PhysicalTemplate) {
	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			type: new foundry.data.fields.SchemaField({
				value: new foundry.data.fields.StringField({intial: "armor", label: "EH.Armor.Types.Label"}),
				category: new foundry.data.fields.StringField({intial: "basic", label: "EH.Equipment.Category.Label[one]"})
			}, {label: "EH.Equipment.Type.Label"}),
			properties: new foundry.data.fields.SetField(new foundry.data.fields.StringField(), {
				label: "EH.Weapon.Properties.Label"
			}),
			armorValue: new foundry.data.fields.NumberField({
				initial: 0, min: 0, integer: true,
				label: "EH.Equipment.Traits.ArmorValue.Label", hint: "EH.Equipment.Traits.ArmorValue.Hint"
			}),
			damaged: new foundry.data.fields.BooleanField({label: "EH.Armor.Damaged"}),
			bonuses: new foundry.data.fields.SchemaField({
				save: new FormulaField({label: "EH.Armor.Bonuses.Save.Label"})
			})
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Getters                                  */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Can armor saving throws be performed by this item?
	 * @type {boolean}
	 */
	get hasArmorSave() {
		return true;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Build a list of roll actions for this item.
	 * @type {object[]}
	 */
	get rollActions() {
		return [
			{
				label: "+4", // TOOD: Add armor save value
				tooltip: game.i18n.format("EH.Action.Roll", {type: game.i18n.localize("EH.Armor.Action.Save.Label")}),
				icon: "systems/everyday-heroes/artwork/svg/action/armor-save.svg",
				data: {
					type: "armor-save",
					disadvantage: this.damaged
				}
			}
		];
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedProficiency() {
		// TODO: Adjust based on actor's actual equipment proficiencies
		this.proficiency = new Proficiency(
			this.parent.actor?.system.attributes.prof,
			this.parent.actor?.system.traits.equipment.has(this.type.category) ? 1 : 0
		);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedTypeLabel() {
		this.type.label = game.i18n.format("EH.Equipment.Type.DetailedLabel", {
			category: CONFIG.EverydayHeroes.equipmentCategories[this.type.category]?.label ?? "",
			type: "",
			subtype: CONFIG.EverydayHeroes.armorTypes[this.type.value] ?? ""
		});
	}

}
