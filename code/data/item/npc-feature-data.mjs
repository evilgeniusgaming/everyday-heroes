import { numberFormat } from "../../utils.mjs";
import ItemDataModel from "../abstract/item-data-model.mjs";
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
export default class NPCFeatureData extends ItemDataModel.mixin(DescribedTemplate, ActivatableTemplate) {

	static get metadata() {
		return {
			type: "npcFeature",
			category: "feature",
			localization: "EH.Item.Type.NPCFeature",
			sheetLocalization: "EH.Item.Type.Feature",
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

	get hasActivation() {
		return super.hasActivation || this.recharge.target;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareFinalRechargeLabel() {
		if ( !this.recharge.target ) this.recharge.label = "";
		else if ( this.recharge.charged ) this.recharge.label = game.i18n.localize("EH.Recharge.State.Charged");
		else this.recharge.label = game.i18n.format("EH.Recharge.State.Uncharged", {
			target: numberFormat(this.recharge.target)
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Helpers                                  */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async npcLabel() {
		let label = await super.npcLabel();
		const actions = this.npcConsumptionLabels();
		if ( actions.length ) {
			const listFormatter = new Intl.ListFormat(game.i18n.lang, { type: "unit" });
			label += ` <span>(${listFormatter.format(actions)})</span>`;
		}
		return label;
	}
}
