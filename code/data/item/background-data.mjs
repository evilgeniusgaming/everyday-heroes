import SystemDataModel from "../abstract/system-data-model.mjs";
import IdentifierField from "../fields/identifier-field.mjs";
import AdvancementTemplate from "./templates/advancement-template.mjs";
import DescribedTemplate from "./templates/described-template.mjs";

/**
 * Data definition for Background items.
 * @mixes {@link AdvancementTemplate}
 * @mixes {@link DescribedTemplate}
 */
export default class BackgroundData extends SystemDataModel.mixin(DescribedTemplate, AdvancementTemplate) {

	static get metadata() {
		return {
			type: "background",
			category: "concept",
			localization: "EH.Item.Type.Background",
			icon: "fa-solid fa-address-card",
			image: "systems/everyday-heroes/artwork/svg/items/background.svg"
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
}
