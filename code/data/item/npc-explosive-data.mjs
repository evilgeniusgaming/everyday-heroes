import { numberFormat } from "../../utils.mjs";
import ExplosiveData from "./explosive-data.mjs";

/**
 * Data definition for NPC Explosive items.
 *
 * @property {object} quantity
 * @property {number} quantity.max - Maximum uses of this explosive.
 * @property {string} quantity.period - Recovery period for this item's uses.
 * @property {object} range
 * @property {number} range.short - Normal range for ranged or thrown weapons.
 * @property {number} range.long - Long range for ranged or thrown weapons.
 * @property {number} range.reach - Reach for melee weapons with the "Reach" property.
 * @property {string} range.units - Units represented by the range values.
 */
export default class NPCExplosiveData extends ExplosiveData {

	static get metadata() {
		return foundry.utils.mergeObject(super.metadata, {
			type: "npcExplosive",
			localization: "EH.Item.Type.NPCExplosive"
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			quantity: new foundry.data.fields.SchemaField({
				max: new foundry.data.fields.NumberField({initial: 1, min: 1, integer: true, label: "EH.Uses.Spent.Label"}),
				period: new foundry.data.fields.StringField({initial: "lr", label: "EH.Uses.Recovery.Period.Label"})
			}),
			range: new foundry.data.fields.SchemaField({
				short: new foundry.data.fields.NumberField({
					initial: 80, min: 0, step: 0.1, label: "EH.Equipment.Trait.Range.Short"
				}),
				long: new foundry.data.fields.NumberField({min: 0, step: 0.1, label: "EH.Equipment.Trait.Range.Long"}),
				units: new foundry.data.fields.StringField({label: "EH.Measurement.Units"})
				// TODO: Set default based on default units setting
			}, {label: "EH.Equipment.Trait.Range.Label", hint: "EH.Equipment.Trait.Range.Hint"})
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get types() {
		return CONFIG.EverydayHeroes.explosiveTypes;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Is range a relevant concept for this weapon?
	 * @type {boolean}
	 */
	get usesRange() {
		return true;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Helpers                                  */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async npcDescription() {
		let description = `<p><em>${game.i18n.format("EH.Weapon.Action.AttackSpecific", {
			type: game.i18n.format("EH.Weapon.Action.ThrownExplosive.Label")
		})}:</em> `;

		const elements = [];
		const listFormatter = new Intl.ListFormat(game.i18n.lang, { type: "unit" });

		// To Hit
		elements.push(`<a data-action="roll-item" data-type="attack">${
			game.i18n.format("EH.Weapon.ToHit", {mod: numberFormat(this.attackMod, {sign: true})}).toLowerCase()}</a>`);

		// Penetration Value
		elements.push(`${game.i18n.localize("EH.Equipment.Trait.PenetrationValue.Abbreviation")} ${
			this.hasDamage ? numberFormat(this.penetrationValue) : game.i18n.localize("EH.NotApplicable.Abbreviation")}`);

		// Range
		const distance = this.range.long > this.range.short
			? `${numberFormat(this.range.short)}/${numberFormat(this.range.long, {unit: this.range.units})}`
			: numberFormat(this.range.short, {unit: this.range.units});
		elements.push(`${game.i18n.localize("EH.Equipment.Trait.Range.Label").toLowerCase()} ${distance}`);

		description += `${listFormatter.format(elements.filter(e => e))}.</p>`;

		// Effect
		if ( this.description.chat ) {
			description += ` <p><em>Effect:</em> ${await TextEditor.enrichHTML(this.description.chat ?? "", {
				secrets: this.parent.isOwner, rollData: this.parent.getRollData(), async: true, relativeTo: this.parent
			})}</p>`;
		}

		return description;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async npcLabel() {
		let label = await super.npcLabel();
		const actions = [];
		const listFormatter = new Intl.ListFormat(game.i18n.lang, { type: "unit" });

		if ( this.quantity.max ) {
			if ( this.quantity.period ) actions.push(`${numberFormat(this.quantity.value)}/${
				CONFIG.EverydayHeroes.recoveryPeriods[this.quantity.period]?.label}`);
			else actions.push(`${numberFormat(this.quantity.value)}/${numberFormat(this.quantity.max)}`);
		}

		if ( actions.length ) label += ` (${listFormatter.format(actions)})`;
		return label;
	}
}
