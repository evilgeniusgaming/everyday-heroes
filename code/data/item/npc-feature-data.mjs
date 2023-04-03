import { numberFormat } from "../../utils.mjs";
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
			icon: "fa-solid fa-otter",
			image: "systems/everyday-heroes/artwork/svg/items/feature.svg"
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			recharge: new foundry.data.fields.SchemaField({
				charged: new foundry.data.fields.BooleanField({initial: true}),
				target: new foundry.data.fields.NumberField({
					min: 1, integer: true, label: "EH.Recharge.Target.Label", hint: "EH.Recharge.Target.Hint"
				})
			}, {label: "EH.Recharge.Label"})
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Does this item consume a charge?
	 * @type {boolean}
	 */
	get consumesRecharge() {
		return !!this.recharge.target;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Helpers                                  */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async npcLabel() {
		let label = await super.npcLabel();
		if ( this.recharge.target ) {
			if ( this.recharge.charged ) label += ` (${game.i18n.localize("EH.Recharge.State.Charged")})`;
			else label += ` (<a data-action="roll-item" data-type="recharge">${
				game.i18n.format("EH.Recharge.State.Uncharged", { target: numberFormat(this.recharge.target) })
			}</a>)`;
		}
		return label;
	}
}
