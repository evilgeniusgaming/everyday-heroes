import { numberFormat } from "../../utils.mjs";
import ItemDataModel from "../abstract/item-data-model.mjs";
import ActivatableTemplate from "./templates/activatable-template.mjs";
import AttackTemplate from "./templates/attack-template.mjs";
import BaseExplosiveTemplate from "./templates/base-explosive-template.mjs";
import DamageTemplate from "./templates/damage-template.mjs";
import DescribedTemplate from "./templates/described-template.mjs";
import EquipmentTemplate from "./templates/equipment-template.mjs";
import PhysicalTemplate from "./templates/physical-template.mjs";
import TypedTemplate from "./templates/typed-template.mjs";

/**
 * Data definition for NPC Explosive items.
 * @mixes {@link ActivatableTemplate}
 * @mixes {@link BaseExplosiveTemplate}
 * @mixes {@link DamageTemplate}
 * @mixes {@link DescribedTemplate}
 * @mixes {@link EquipmentTemplate}
 * @mixes {@link PhysicalTemplate}
 * @mixes {@link TypedTemplate}
 *
 * @property {object} range
 * @property {number} range.short - Normal range for ranged or thrown weapons.
 * @property {number} range.long - Long range for ranged or thrown weapons.
 * @property {number} range.reach - Reach for melee weapons with the "Reach" property.
 * @property {string} range.units - Units represented by the range values.
 */
export default class NPCExplosiveData extends ItemDataModel.mixin(
	ActivatableTemplate, AttackTemplate, DamageTemplate, DescribedTemplate,
	EquipmentTemplate, PhysicalTemplate, TypedTemplate, BaseExplosiveTemplate
) {

	static get metadata() {
		return {
			type: "npcExplosive",
			category: "physical",
			localization: "EH.Item.Type.NPCExplosive",
			sheetLocalization: "EH.Item.Type.Explosive",
			icon: "fa-solid fa-burst",
			image: "systems/everyday-heroes/artwork/svg/items/explosive.svg",
			advancement: {
				grantable: true
			},
			variant: "explosive"
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			activation: new foundry.data.fields.SchemaField({
				type: new foundry.data.fields.StringField({initial: "attack"})
			}),
			range: new foundry.data.fields.SchemaField({
				short: new foundry.data.fields.NumberField({
					initial: 80, min: 0, step: 0.1, label: "EH.Equipment.Trait.Range.Short.Label",
					hint: "EH.Equipment.Trait.Range.Short.Hint"
				}),
				long: new foundry.data.fields.NumberField({
					min: 0, step: 0.1, label: "EH.Equipment.Trait.Range.Long.Label", hint: "EH.Equipment.Trait.Range.Long.Hint"
				}),
				units: new foundry.data.fields.StringField({
					label: "EH.Measurement.Units", suggestions: [...Object.keys(CONFIG.EverydayHeroes.lengthUnits), "spaces"]
				})
			}, {label: "EH.Equipment.Trait.Range.Label", hint: "EH.Equipment.Trait.Range.Hint"})
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Migrations                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static migrateUses(source) {
		if ( source.uses || !source.quantity?.period || !source.quantity?.max ) return;
		source.uses = {
			max: source.quantity.max,
			period: source.quantity.period
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get isEquippable() {
		return true;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Is this explosive on a titanic creature?
	 * @type {boolean|void}
	 */
	get isTitanic() {
		return this.actor?.system.traits?.isTitanic;
	}

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
			(this.hasDamage && this.penetrationValue !== null)
				? numberFormat(this.penetrationValue)
				: game.i18n.localize("EH.NotApplicable.Abbreviation")
		}`);

		// Range
		const distance = this.range.long > this.range.short
			? `${numberFormat(this.range.short)}/${numberFormat(this.range.long, {unit: this.range.units})}`
			: numberFormat(this.range.short, {unit: this.range.units});
		elements.push(`${game.i18n.localize("EH.Equipment.Trait.Range.Label").toLowerCase()} ${distance}`);

		description += `${listFormatter.format(elements.filter(e => e))}.</p>`;

		// Effect
		if ( this.description.chat ) {
			description += ` <p><em>Effect:</em> ${await foundry.applications.ux.TextEditor.implementation.enrichHTML(
				this.description.chat ?? "",
				{ secrets: this.parent.isOwner, rollData: this.getRollData(), async: true, relativeTo: this.parent }
			)}</p>`;
		}

		return description;
	}

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
