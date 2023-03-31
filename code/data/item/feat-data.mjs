import SystemDataModel from "../abstract/system-data-model.mjs";
import IdentifierField from "../fields/identifier-field.mjs";
import ActivatableTemplate from "./templates/activatable-template.mjs";
import AdvancementTemplate from "./templates/advancement-template.mjs";
import DescribedTemplate from "./templates/described-template.mjs";
import TypedTemplate from "./templates/typed-template.mjs";

/**
 * Data definition for Feat items.
 * @mixes {@link ActivatableTemplate}
 * @mixes {@link AdvancementTemplate}
 * @mixes {@link DescribedTemplate}
 * @mixes {@link TypedTemplate}
 *
 * @property {object} type
 * @property {string} type.category - Specific category of feat (basic, advanced, multiclass).
 */
export default class FeatData extends SystemDataModel.mixin(
	DescribedTemplate, ActivatableTemplate, AdvancementTemplate, TypedTemplate
) {

	static get metadata() {
		return {
			type: "feat",
			category: "feature",
			localization: "EH.Item.Type.Feat",
			icon: "fa-solid fa-house-user"
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			identifier: new foundry.data.fields.SchemaField({
				value: new IdentifierField({label: "Identifier.Label"})
			}),
			type: new foundry.data.fields.SchemaField({
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
		}).trim().replace("  ", " ");
		// TODO: Multiclass feats should display like "Strong Hero Multiclass Feat"
	}
}

// TODO: Add restrictions
//  - Can you take this feat multiple times?
//  - What other archetype, class, or feat does this feat require?
//  - Minimum level required to take the feat
//  - Minimum ability score required to take the feat
