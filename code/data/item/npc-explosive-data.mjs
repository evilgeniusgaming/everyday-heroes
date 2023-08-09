import { numberFormat } from "../../utils.mjs";
import ExplosiveData from "./explosive-data.mjs";
import ActivatableTemplate from "./templates/activatable-template.mjs";

/**
 * Data definition for NPC Explosive items.
 * @mixes {ActivatableTemplate}
 *
 * @property {object} range
 * @property {number} range.short - Normal range for ranged or thrown weapons.
 * @property {number} range.long - Long range for ranged or thrown weapons.
 * @property {number} range.reach - Reach for melee weapons with the "Reach" property.
 * @property {string} range.units - Units represented by the range values.
 */
export default class NPCExplosiveData extends ExplosiveData.mixin(ActivatableTemplate) {

	static get metadata() {
		return foundry.utils.mergeObject(super.metadata, {
			type: "npcExplosive",
			localization: "EH.Item.Type.NPCExplosive",
			sheetLocalization: "EH.Item.Type.Explosive",
			variant: "explosive"
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		// TODO: Consider switching to using a "Weapon" template to define shared core functionality
		// Alternatively find a way for this to properly merge without this extra consideration.
		const parentSchema = this.mergeSchema(super.defineSchema(), ActivatableTemplate.defineSchema());
		return this.mergeSchema(parentSchema, {
			activation: new foundry.data.fields.SchemaField({
				type: new foundry.data.fields.StringField({initial: "attack"})
			}),
			range: new foundry.data.fields.SchemaField({
				short: new foundry.data.fields.NumberField({
					initial: 80, min: 0, step: 0.1, label: "EH.Equipment.Trait.Range.Short"
				}),
				long: new foundry.data.fields.NumberField({min: 0, step: 0.1, label: "EH.Equipment.Trait.Range.Long"}),
				units: new foundry.data.fields.StringField({label: "EH.Measurement.Units"})
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
			description += ` <p><em>Effect:</em> ${await TextEditor.enrichHTML(this.description.chat ?? "", {
				secrets: this.parent.isOwner, rollData: this.getRollData(), async: true, relativeTo: this.parent
			})}</p>`;
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

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Update operations required to convert to and from titanic scale.
	 * @param {boolean} isTitanic - After update, will this parent actor be titanic?
	 * @returns {object}
	 */
	titanicConversions(isTitanic) {
		if ( (isTitanic && (this.radius.units === "space")) || (!isTitanic && (this.radius.units !== "space")) ) return {};
		const updates = {};
		const adjustValue = keyPath => {
			updates[keyPath] = Math.floor(foundry.utils.getProperty(this.parent, keyPath) * (isTitanic ? 0.2 : 5));
		};
		adjustValue("system.radius.value");
		updates["system.radius.units"] = isTitanic ? "space" : "foot";
		adjustValue("system.range.short");
		adjustValue("system.range.long");
		updates["system.range.units"] = isTitanic ? "space" : "foot";
		return updates;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Socket Event Handlers                    */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async _preCreate(data, options, user) {
		const updates = this.titanicConversions(this.isTitanic);
		if ( !foundry.utils.isEmpty(updates) ) this.parent.updateSource(updates);
	}
}
