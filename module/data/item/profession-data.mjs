import SystemDataModel from "../abstract/system-data-model.mjs";
import AdvancementTemplate from "./templates/advancement-template.mjs";
import DescribedTemplate from "./templates/described-template.mjs";

/**
 * Data definition for Profession items.
 * @mixes {@link AdvancementTemplate}
 * @mixes {@link DescribedTemplate}
 *
 * @property {number} wealth - Starting wealth level this profession provides.
 */
export default class ProfessionData extends SystemDataModel.mixin(DescribedTemplate, AdvancementTemplate) {
	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			wealth: new foundry.data.fields.NumberField({
				nullable: false, initial: 0, min: 0, integer: true, label: "EH.Details.Wealth.Label"
			})
		});
	}
}
