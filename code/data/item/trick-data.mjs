import SystemDataModel from "../abstract/system-data-model.mjs";
import IdentifierField from "../fields/identifier-field.mjs";
import ActivatableTemplate from "./templates/activatable-template.mjs";
import DescribedTemplate from "./templates/described-template.mjs";

/**
 * Data definition for Trick items.
 * @mixes {@link ActivatableTemplate}
 * @mixes {@link DescribedTemplate}
 */
export default class TrickData extends SystemDataModel.mixin(DescribedTemplate, ActivatableTemplate) {

	static get metadata() {
		return {
			type: "trick",
			category: "feature",
			localization: "EH.Item.Type.Trick",
			icon: "fa-solid fa-ruler",
			image: "systems/everyday-heroes/artwork/svg/items/plan-trick.svg"
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			identifier: new foundry.data.fields.SchemaField({
				value: new IdentifierField({label: "Identifier.Label"}),
				class: new IdentifierField({label: "", hint: ""})
			})
		});
	}
}

// TODO: Automatically fix consumption.target to consume a "influence"
