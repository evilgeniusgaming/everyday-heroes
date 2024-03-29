import ItemDataModel from "../abstract/item-data-model.mjs";
import IdentifierField from "../fields/identifier-field.mjs";
import AdvancementTemplate from "./templates/advancement-template.mjs";
import DescribedTemplate from "./templates/described-template.mjs";

/**
 * Data definition for Class items.
 * @mixes {@link AdvancementTemplate}
 * @mixes {@link DescribedTemplate}
 *
 * @property {object} identifier
 * @property {string} identifier.value - Class's identifier.
 * @property {string} identifier.archetype - Archetype with which this class is associated.
 */
export default class ClassData extends ItemDataModel.mixin(DescribedTemplate, AdvancementTemplate) {

	static get metadata() {
		return {
			type: "class",
			category: "concept",
			localization: "EH.Item.Type.Class",
			icon: "fa-solid fa-landmark-flag",
			image: "systems/everyday-heroes/artwork/svg/items/class.svg",
			register: true
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			identifier: new foundry.data.fields.SchemaField({
				value: new IdentifierField({label: "EH.Identifier.Label", hint: "EH.Identifier.Hint"}),
				archetype: new IdentifierField({label: "EH.Item.Type.Archetype[one]", hint: "EH.Identifier.ClassArchetype.Hint"})
			})
		});
	}
}
