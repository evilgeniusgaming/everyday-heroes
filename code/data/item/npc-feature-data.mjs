import SystemDataModel from "../abstract/system-data-model.mjs";
import ActivatableTemplate from "./templates/activatable-template.mjs";
import DescribedTemplate from "./templates/described-template.mjs";

/**
 * Data definition for NPC Feature items.
 * @mixes {@link ActivatableTemplate}
 * @mixes {@link DescribedTemplate}
 *
 * @property {object} recharge
 * @property {boolean} recharge.charged - Is this item currently charged?
 * @property {number} recharge.target - Target on a D6 role required to recharge this item's usage.
 */
export default class NPCFeatureData extends SystemDataModel.mixin(DescribedTemplate, ActivatableTemplate) {

	static get metadata() {
		return {
			type: "npcFeature",
			category: "feature",
			localization: "EH.Item.Type.NPCFeature",
			icon: "fa-solid fa-otter"
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			recharge: new foundry.data.fields.SchemaField({
				charged: new foundry.data.fields.BooleanField({label: ""}),
				target: new foundry.data.fields.NumberField({min: 1, integer: true, label: ""})
			}, {label: ""})
		});
	}
}
