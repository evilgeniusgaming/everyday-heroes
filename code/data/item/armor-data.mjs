import Proficiency from "../../documents/proficiency.mjs";
import { simplifyBonus } from "../../utils.mjs";
import ItemDataModel from "../abstract/item-data-model.mjs";
import FormulaField from "../fields/formula-field.mjs";
import DescribedTemplate from "./templates/described-template.mjs";
import EquipmentTemplate from "./templates/equipment-template.mjs";
import PhysicalTemplate from "./templates/physical-template.mjs";
import TypedTemplate from "./templates/typed-template.mjs";

/**
 * Data definition for Armor items.
 * @mixes {@link DescribedTemplate}
 * @mixes {@link EquipmentTemplate}
 * @mixes {@link PhysicalTemplate}
 * @mixes {@link TypedTemplate}
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
export default class ArmorData extends ItemDataModel.mixin(
	DescribedTemplate, EquipmentTemplate, PhysicalTemplate, TypedTemplate
) {

	static get metadata() {
		return {
			type: "armor",
			category: "physical",
			localization: "EH.Item.Type.Armor",
			icon: "fa-solid fa-shield-halved",
			image: "systems/everyday-heroes/artwork/svg/items/armor.svg",
			advancement: {
				grantable: true
			}
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			type: new foundry.data.fields.SchemaField({
				value: new foundry.data.fields.StringField({
					intial: "armor", label: "EH.Armor.Type.Label", suggestions: CONFIG.EverydayHeroes.armorTypes
				}),
				category: new foundry.data.fields.StringField({
					intial: "basic", label: "EH.Equipment.Category.Label[one]", suggestions: CONFIG.EverydayHeroes.equipmentCategories
				})
			}, {label: "EH.Item.Type.Label"}),
			properties: new foundry.data.fields.SetField(new foundry.data.fields.StringField({
				suggestions: CONFIG.EverydayHeroes.applicableProperties.armor
			}), {
				label: "EH.Weapon.Property.Label"
			}),
			armorValue: new foundry.data.fields.NumberField({
				initial: 0, min: 0, integer: true,
				label: "EH.Equipment.Trait.ArmorValue.Label", hint: "EH.Equipment.Trait.ArmorValue.Hint"
			}),
			damaged: new foundry.data.fields.BooleanField({label: "EH.Armor.Damage.Label", hint: "EH.Armor.Damage.Hint"}),
			bonuses: new foundry.data.fields.SchemaField({
				save: new FormulaField({label: "EH.Armor.Bonuses.Save.Label", hint: "EH.Armor.Bonuses.Save.Hint"})
			})
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static getCompendiumSection(index, sorting) {
		const type = foundry.utils.getProperty(index, "system.type.value");
		const key = type ?? "armor";
		// TODO: Use plural form for shields
		return [key, {
			label: CONFIG.EverydayHeroes.armorTypes[type]?.label ?? "",
			sort: sorting[key] ?? Infinity
		}];
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
		}, {
			action: "item",
			label: game.i18n.localize(`EH.Armor.State.${this.damaged ? "Damaged" : "Intact"}`),
			icon: `systems/everyday-heroes/artwork/svg/action/armor-${this.damaged ? "damaged" : "intact"}.svg`,
			tooltip: game.i18n.format(`EH.Armor.Action.${this.damaged ? "Repair" : "Damage"}.Label`, {
				type: CONFIG.EverydayHeroes.armorTypes[this.type.value]?.label ?? ""
			}),
			data: { type: `armor-${this.damaged ? "repair" : "damage"}` }
		}];
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * The simplified armor save modifier for this item.
	 * @type {number}
	 */
	get armorSaveMod() {
		return (Number.isNumeric(this.proficiency?.term) ? this.proficiency.flat : 0)
			+ simplifyBonus(this.bonuses.save, this.getRollData());
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
			...this.proficiencyTags,
			...this.physicalTags,
			{
				label: game.i18n.localize("EH.Armor.State.Damaged"),
				tooltip: "EH.Armor.State.Hint",
				class: "negative status", hidden: !this.damaged }
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

	get isEquippable() {
		return this.actor?.type === "hero";
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedTypeLabel() {
		this.type.label = game.i18n.format("EH.Item.Type.DetailedLabel", {
			category: CONFIG.EverydayHeroes.equipmentCategories[this.type.category]?.label ?? "",
			type: "",
			subtype: CONFIG.EverydayHeroes.armorTypes[this.type.value]?.label ?? ""
		}).trim().replace("  ", " ");
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareFinalArmorProficiency() {
		if ( this.proficiency.hasProficiency ) return;
		if ( this.user?.system.overrides?.ability?.saveProficiency?.multiplier ) {
			this.proficiency = new Proficiency(
				this.user.system.attributes?.prof ?? 0,
				this.user.system.overrides.ability.saveProficiency.multiplier,
				this.user.system.overrides.ability.saveProficiency.rounding
			);
		}
	}
}
