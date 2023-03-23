import SystemDataModel from "../abstract/system-data-model.mjs";
import DescribedTemplate from "./templates/described-template.mjs";
import PhysicalTemplate from "./templates/physical-template.mjs";

/**
 * Data definition for Gear items.
 * @mixes {@link DescribedTemplate}
 * @mixes {@link PhysicalTemplate}
 *
 * @property {object} type
 * @property {string} type.value - What type of gear is this?
 */
export default class GearData extends SystemDataModel.mixin(DescribedTemplate, PhysicalTemplate) {

	static metadata = {
		type: "gear",
		category: "physical",
		localization: "EH.Item.Type.Gear",
		icon: "fa-solid fa-bag-shopping",
		image: "systems/everyday-heroes/artwork/svg/items/gear.svg"
	};

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			type: new foundry.data.fields.SchemaField({
				value: new foundry.data.fields.StringField({label: "EH.Weapon.Type.Label"})
			}, {label: "EH.Item.Type.Label"})
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get hasDetails() {
		return false;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedTypeLabel() {
		this.type.label = CONFIG.EverydayHeroes.gearTypes[this.type.value]?.label ?? "";
	}
}

// Data: required, nullable, initial, validate, label, hint, validationError
// String: blank, trim, choices
// Number: min, max, step, integer, positive, choices
