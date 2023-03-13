import SystemDataModel from "../abstract/system-data-model.mjs";
import ActivatableTemplate from "./templates/activatable-template.mjs";
import DescribedTemplate from "./templates/described-template.mjs";

/**
 * Data definition for Talent items.
 * @mixes {@link ActivatableTemplate}
 * @mixes {@link DescribedTemplate}
 *
 * @property {object} type
 * @property {string} type.value - Specific talent type (archetype or class).
 * @property {number} type.level - Level at which this talent is granted.
 */
export default class TalentData extends SystemDataModel.mixin(DescribedTemplate, ActivatableTemplate) {
	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			type: new foundry.data.fields.SchemaField({
				value: new foundry.data.fields.StringField({label: ""}),
				level: new foundry.data.fields.NumberField({label: ""})
			})
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedTypeLabel() {
		this.type.label = game.i18n.format("EH.Item.Type.DetailedLabel", {
			category: "",
			type: game.i18n.localize("EH.Item.Type.Talent[one]"),
			subtype: CONFIG.EverydayHeroes.talentTypes[this.type.value]?.label ?? ""
		}).trim();
	}
}
