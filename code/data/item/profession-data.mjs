import ItemDataModel from "../abstract/item-data-model.mjs";
import IdentifierField from "../fields/identifier-field.mjs";
import AdvancementTemplate from "./templates/advancement-template.mjs";
import DescribedTemplate from "./templates/described-template.mjs";

/**
 * Data definition for Profession items.
 * @mixes {@link AdvancementTemplate}
 * @mixes {@link DescribedTemplate}
 *
 *
 * @property {object} identifier
 * @property {string} identifier.value - Profession's identifier.
 * @property {number} wealth - Starting wealth level this profession provides.
 */
export default class ProfessionData extends ItemDataModel.mixin(DescribedTemplate, AdvancementTemplate) {

	static get metadata() {
		return {
			type: "profession",
			category: "concept",
			localization: "EH.Item.Type.Profession",
			icon: "fa-solid fa-user-tie",
			image: "systems/everyday-heroes/artwork/svg/items/profession.svg",
			register: true
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			identifier: new foundry.data.fields.SchemaField({
				value: new IdentifierField({label: "EH.Identifier.Label"})
			}),
			wealth: new foundry.data.fields.NumberField({
				nullable: false, initial: 0, min: 0, integer: true, label: "EH.Details.Wealth.Label"
			})
		});
	}
}
