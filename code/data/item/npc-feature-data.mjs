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
		const actions = [];
		const listFormatter = new Intl.ListFormat(game.i18n.lang, { type: "unit" });

		if ( this.uses.max ) {
			if ( this.uses.period ) actions.push(`${numberFormat(this.uses.available)}/${
				CONFIG.EverydayHeroes.recoveryPeriods[this.uses.period]?.label}`);
			else actions.push(`${numberFormat(this.uses.available)}/${numberFormat(this.uses.max)}`);
		}

		if ( this.recharge.target ) actions.push(`${
			!this.recharge.charged ? '<a data-action="roll-item" data-type="recharge">' : ""}${
			this.recharge.label}${!this.recharge.charged ? "</a>" : ""
		}`);

		if ( actions.length ) label += ` (${listFormatter.format(actions)})`;
		return label;
	}
}
