import SystemDataModel from "../abstract/system-data-model.mjs";
import ActivatableTemplate from "./templates/activatable-template.mjs";
import DescribedTemplate from "./templates/described-template.mjs";

/**
 * Data definition for Feat items.
 * @mixes {@link ActivatableTemplate}
 * @mixes {@link DescribedTemplate}
 *
 * @property {object} type
 * @property {string} type.value - Type of the feat (major or minor).
 * @property {string} type.category - Specific category of feat (basic, advanced, multiclass).
 */
export default class FeatData extends SystemDataModel.mixin(DescribedTemplate, ActivatableTemplate) {
	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			type: new foundry.data.fields.SchemaField({
				value: new foundry.data.fields.StringField({label: ""}),
				category: new foundry.data.fields.StringField({label: ""})
			})
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedTypeLabel() {
		const subtype = this.type.category === "advanced"
			? CONFIG.EverydayHeroes.featTypes[this.type.value]?.label ?? "" : "";
		this.type.label = game.i18n.format("EH.Item.Type.DetailedLabel", {
			category: CONFIG.EverydayHeroes.featCategories[this.type.category]?.label ?? "",
			type: game.i18n.localize("EH.Item.Type.Feat[one]"),
			subtype
		}).trim();
		// TODO: Multiclass feats should display like "Strong Hero Multiclass Feat"
	}
}

// TODO: Add restrictions
//  - Can you take this feat multiple times?
//  - What other archetype, class, or feat does this feat require?
//  - Minimum level required to take the feat
//  - Minimum ability score required to take the feat