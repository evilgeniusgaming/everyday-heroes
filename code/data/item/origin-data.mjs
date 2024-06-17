import ItemDataModel from "../abstract/item-data-model.mjs";
import IdentifierField from "../fields/identifier-field.mjs";
import AdvancementTemplate from "./templates/advancement-template.mjs";
import DescribedTemplate from "./templates/described-template.mjs";

/**
 * Data definition for Origin items.
 * @mixes {@link AdvancementTemplate}
 * @mixes {@link DescribedTemplate}
 *
 * @property {object} identifier
 * @property {string} identifier.value - Origin's identifier.
 */
export default class OriginData extends ItemDataModel.mixin(DescribedTemplate, AdvancementTemplate) {

	static get metadata() {
		return {
			type: "origin",
			category: "concept",
			localization: "EH.Item.Type.Origin",
			icon: "fa-solid fa-egg",
			image: "systems/everyday-heroes/artwork/svg/items/origin.svg",
			register: true
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			identifier: new foundry.data.fields.SchemaField({
				value: new IdentifierField({label: "EH.Identifier.Label", hint: "EH.Identifier.Hint"})
			})
		});
	}
}
