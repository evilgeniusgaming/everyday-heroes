import { numberFormat } from "../../../utils.mjs";
import MappingField from "../../fields/mapping-field.mjs";

/**
 * Data model template for actors that have movement.
 * @mixin
 *
 * @property {object} attributes
 * @property {object} attributes.movement
 * @property {number} attributes.movement.value - Base walking speed.
 * @property {Object<number>} attributes.movement.special - Other movement types.
 * @property {string} attributes.movement.units - Units used to measure movements speeds.
 * @property {Set<string>} attributes.movement.tags - Tags that describe additional movement properties.
 * @property {number} attributes.movement.multiplier - Value by which all speeds will be multiplied.
 */
export default class MovementTemplate extends foundry.abstract.DataModel {
	static defineSchema() {
		const speedConfig = { nullable: false, initial: 30, min: 0, step: 0.1 };
		return {
			attributes: new foundry.data.fields.SchemaField({
				movement: new foundry.data.fields.SchemaField({
					value: new foundry.data.fields.NumberField({
						...speedConfig, label: "EH.Movement.Base.Label", hint: "EH.Movement.Base.Hint"
					}),
					special: new MappingField(new foundry.data.fields.NumberField({ ...speedConfig }), {
						label: "EH.Movement.Special.Label", hint: "EH.Movement.Special.Hint"
					}),
					units: new foundry.data.fields.StringField({
						initial: "foot", label: "EH.Measurement.Units",
						suggestions: [...Object.keys(CONFIG.EverydayHeroes.lengthUnits), "spaces"]
					}),
					tags: new foundry.data.fields.ArrayField(new foundry.data.fields.StringField(), {
						label: "EH.Movement.Tags.Label", hint: "EH.Movement.Tags.Hint",
						suggestions: CONFIG.EverydayHeroes.movementTags
					}),
					multiplier: new foundry.data.fields.NumberField({
						min: 0, label: "EH.Movement.Multiplier.Label", hint: "EH.Movement.Multiplier.Hint"
					})
				}, {label: "EH.Speed.Label"})
			})
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedMovementMultiplier() {
		const multiplier = this.attributes.movement.multiplier ?? 1;
		this.attributes.movement.value = Math.floor(this.attributes.movement.value * multiplier);
		for ( const key of Object.keys(this.attributes.movement.special) ) {
			this.attributes.movement.special[key] *= multiplier;
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedMovementReduction() {
		let hasAwkwardArmor = false;
		let hasAwkwardShield = false;
		for ( const item of this.parent?.items ?? [] ) {
			if ( (item.type !== "armor") || !item.system.equipped || !item.system.properties.has("awkward") ) continue;
			if ( item.system.type.value === "armor" ) hasAwkwardArmor = true;
			else if ( item.system.type.value === "shield" ) hasAwkwardShield = true;
		}
		this.attributes.movement.reduction = 0 + (hasAwkwardArmor ? 10 : 0) + (hasAwkwardShield ? 10 : 0);
		this.attributes.movement.reductionSource = hasAwkwardArmor ? "armor" : hasAwkwardShield ? "shield" : null;
		this.attributes.movement.value -= this.attributes.movement.reduction;
		for ( const [key, value] of Object.entries(this.attributes.movement.special) ) {
			this.attributes.movement.special[key] = Math.max(0, value - this.attributes.movement.reduction);
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedMovementLabel() {
		let movements = [];
		const tags = new Set(this.attributes.movement.tags);
		const listFormatter = new Intl.ListFormat(game.i18n.lang, { type: "unit" });
		const tagFormatter = t => CONFIG.EverydayHeroes.movementTags[t]?.label.toLowerCase() ?? t.toLowerCase();
		const opt = { unit: this.attributes.movement.units };

		// Base speed
		movements.push([this.attributes.movement.value, numberFormat(this.attributes.movement.value, opt)]);

		// Special speeds
		for ( const [key, speed] of Object.entries(this.attributes.movement.special) ) {
			let label = `${(CONFIG.EverydayHeroes.movementTypes[key] ?? key).toLowerCase()} ${numberFormat(speed, opt)}`;
			const thisTags = tags.filter(t => CONFIG.EverydayHeroes.movementTags[t]?.associatedType === key);
			thisTags.forEach(t => tags.delete(t));
			if ( thisTags.size ) label += ` (${listFormatter.format(thisTags.map(t => tagFormatter(t)))})`;
			movements.push([speed, label]);
		}

		// Any remaining tags go with base speed
		if ( tags.size ) movements[0][1] += ` (${listFormatter.format(tags.map(t => tagFormatter(t)))})`;

		// Speed reduction
		if ( this.attributes.movement.reduction ) movements = movements.map(([speed, label]) => `${label} (${
			game.i18n.format("EH.Speed.WithoutReduction", {
				speed: numberFormat(speed + this.attributes.movement.reduction, opt),
				type: CONFIG.EverydayHeroes.armorTypes[this.attributes.movement.reductionSource].label.toLowerCase()
			})
		})`);
		else movements = movements.map(a => a[1]);

		// Create the label
		this.attributes.movement.label = listFormatter.format(movements);
	}
}
