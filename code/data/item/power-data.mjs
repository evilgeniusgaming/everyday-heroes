import SystemDataModel from "../abstract/system-data-model.mjs";
import IdentifierField from "../fields/identifier-field.mjs";
import ActivatableTemplate from "./templates/activatable-template.mjs";
import DescribedTemplate from "./templates/described-template.mjs";

/**
 * Data definition for Power items.
 * @mixes {@link ActivatableTemplate}
 * @mixes {@link DescribedTemplate}
 *
 * @property {object} identifier
 * @property {string} identifier.value - Identifier of this power.
 * @property {string} identifier.class - Identifier for the class required to take this power.
 */
export default class PowerData extends SystemDataModel.mixin(DescribedTemplate, ActivatableTemplate) {

	static get metadata() {
		return {
			type: "power",
			category: "feature",
			localization: "EH.Item.Type.Power",
			icon: "fa-solid fa-ruler",
			image: "systems/everyday-heroes/artwork/svg/items/plan-trick.svg"
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			identifier: new foundry.data.fields.SchemaField({
				value: new IdentifierField({label: "EH.Identifier.Label"}),
				class: new IdentifierField({label: "EH.Item.Type.Class[one]"})
			}),
			resource: new foundry.data.fields.SchemaField({
				amount: new foundry.data.fields.NumberField({initial: 1}),
				target: new foundry.data.fields.StringField({initial: "focus"}),
				type: new foundry.data.fields.StringField({initial: "resource"})
			})
		});
	}
}
