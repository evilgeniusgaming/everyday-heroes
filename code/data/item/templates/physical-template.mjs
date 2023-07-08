import { numberFormat } from "../../../utils.mjs";
import ItemDataModel from "../../abstract/item-data-model.mjs";
import DerivedField from "../../fields/derived-field.mjs";

/**
 * Data model template for physical items.
 *
 * @property {boolean} equipped - Is this item currently equipped?
 * @property {object} quantity
 * @property {number} quantity.value - How many of this item are there?
 * @property {number} bulk - How heavy/unwieldy is this item?
 * @property {number} price - How much wealth is required to purchase this item?
 * @mixin
 */
export default class PhysicalTemplate extends ItemDataModel {
	static defineSchema() {
		return {
			equipped: new DerivedField(model => {
				const defaultEquipped = model.actor?.type === "npc";
				return model.actorContext?.equipped ?? (model.isEquippable ? defaultEquipped : false);
			}, {label: "EH.Item.State.Equipped"}),
			quantity: new foundry.data.fields.SchemaField({
				value: new foundry.data.fields.NumberField({
					required: true, nullable: false, initial: 1, min: 0, integer: true, label: "EH.Equipment.Trait.Quantity.Label"
				})
			}),
			bulk: new foundry.data.fields.NumberField({
				required: true, nullable: false, initial: 0, min: 0, integer: true,
				label: "EH.Equipment.Trait.Bulk.Label", hint: "EH.Equipment.Trait.Bulk.Hint"
			}),
			price: new foundry.data.fields.NumberField({
				required: true, nullable: false, initial: 0, min: 0, integer: true,
				label: "EH.Equipment.Trait.PriceLevel.Label", hint: "EH.Equipment.Trait.PriceLevel.Hint"
			})
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Should the details tab be displayed on the sheet for this item type?
	 * @type {boolean}
	 */
	get hasDetails() {
		return true;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Can this item be equipped on player sheets?
	 * @type {boolean}
	 */
	get isEquippable() {
		return false;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare tags for physical details of this item.
	 * @type {ChatTag[]}
	 */
	get physicalTags() {
		const tags = [];
		if ( this.price ) tags.push({
			label: `${game.i18n.localize("EH.Equipment.Trait.PriceLevel.Label")} ${numberFormat(this.price)}`,
			class: "type"
		});
		if ( this.bulk ) tags.push({
			label: `${game.i18n.localize("EH.Equipment.Trait.Bulk.Label")} ${numberFormat(this.bulk)}`,
			class: "type"
		});
		return tags;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Actor currently using the item.
	 * @type {ActorEH|null}
	 */
	get user() {
		return this.actor;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Helpers                                  */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	getRollData(options) {
		return super.getRollData({ ...options, actor: this.user });
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Socket Event Handlers                    */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_onCreate(data, options, userId) {
		// This is fine for now, but if other templates add their own _onCreate method this might be overwritten
		super._onCreate(data, options, userId);
		if ( (userId !== game.user.id) || !this.actor ) return;
		this.actor.update({[`system.items.${this.parent.id}`]: {}});
	}
}
