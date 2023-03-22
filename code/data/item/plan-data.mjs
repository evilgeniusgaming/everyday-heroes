import SystemDataModel from "../abstract/system-data-model.mjs";
import IdentifierField from "../fields/identifier-field.mjs";
import ActivatableTemplate from "./templates/activatable-template.mjs";
import DescribedTemplate from "./templates/described-template.mjs";

/**
 * Data definition for Plan items.
 * @mixes {@link ActivatableTemplate}
 * @mixes {@link DescribedTemplate}
 *
 * @property {object} identifier
 * @property {string} identifier.class - Identifier for the class required to take this plan.
 */
export default class PlanData extends SystemDataModel.mixin(DescribedTemplate, ActivatableTemplate) {
	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			identifier: new foundry.data.fields.SchemaField({
				value: new IdentifierField({label: "Identifier.Label"}),
				class: new IdentifierField({label: "", hint: ""})
			})
		});
	}
}

// TODO: Automatically fix consumption.target to consume a "genius"
