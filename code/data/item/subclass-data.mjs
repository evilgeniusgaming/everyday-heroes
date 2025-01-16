import ItemDataModel from "../abstract/item-data-model.mjs";
import IdentifierField from "../fields/identifier-field.mjs";
import AdvancementTemplate from "./templates/advancement-template.mjs";
import DescribedTemplate from "./templates/described-template.mjs";

/**
 * Data definition for Subclass items.
 * @mixes {@link AdvancementTemplate}
 * @mixes {@link DescribedTemplate}
 *
 * @property {object} identifier
 * @property {string} identifier.value - Identifier of this spirit bond.
 * @property {string} identifier.class - Class with which this subclass is associated.
 */
export default class SubclassData extends ItemDataModel.mixin(DescribedTemplate, AdvancementTemplate) {

	static get metadata() {
		return {
			type: "subclass",
			category: "concept",
			localization: "EH.Item.Type.Subclass",
			icon: "fa-solid fa-ghost",
			image: "systems/everyday-heroes/artwork/svg/items/subclass.svg",
			register: true
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			identifier: new foundry.data.fields.SchemaField({
				value: new IdentifierField({ label: "EH.Identifier.Label", hint: "EH.Identifier.Hint" }),
				class: new IdentifierField({label: "EH.Item.Type.Class[one]", hint: "EH.Identifier.SubclassClass.Hint"})
			})
		});
	}
}
