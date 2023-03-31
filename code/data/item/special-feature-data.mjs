import SystemDataModel from "../abstract/system-data-model.mjs";
import IdentifierField from "../fields/identifier-field.mjs";
import ActivatableTemplate from "./templates/activatable-template.mjs";
import DescribedTemplate from "./templates/described-template.mjs";
import TypedTemplate from "./templates/typed-template.mjs";

/**
 * Data definition for Special Feature items.
 * @mixes {@link ActivatableTemplate}
 * @mixes {@link DescribedTemplate}
 * @mixes {@link TypedTemplate}
 */
export default class SpecialFeatureData extends SystemDataModel.mixin(
	DescribedTemplate, ActivatableTemplate, TypedTemplate
) {

	static get metadata() {
		return {
			type: "specialFeature",
			category: "feature",
			localization: "EH.Item.Type.SpecialFeature",
			icon: "fa-solid fa-users-rectangle"
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			identifier: new foundry.data.fields.SchemaField({
				value: new IdentifierField({label: "Identifier.Label"})
			})
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedTypeLabel() {
		this.type.label = game.i18n.format("EH.Item.Type.DetailedLabel", {
			category: "",
			type: game.i18n.localize("EH.Item.Type.SpecialFeature[one]"),
			subtype: CONFIG.EverydayHeroes.specialFeatureTypes[this.type.value]?.label ?? ""
		}).trim();
	}
}
