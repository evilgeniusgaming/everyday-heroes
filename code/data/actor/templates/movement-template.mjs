import { numberFormat } from "../../../utils.mjs";
import MappingField from "../../fields/mapping-field.mjs";

/**
 * Data model template for actors that have movement.
 * @mixin
 */
export default class MovementTemplate extends foundry.abstract.DataModel {
	static defineSchema() {
		const speedConfig = { nullable: false, initial: 30, min: 0, step: 0.1 };
		return {
			attributes: new foundry.data.fields.SchemaField({
				movement: new foundry.data.fields.SchemaField({
					value: new foundry.data.fields.NumberField({
						...speedConfig, label: "EH.Speed.Base.Label"
					}),
					special: new MappingField(new foundry.data.fields.NumberField({ ...speedConfig }), {
						label: "EH.Speed.Special.Label"
					}),
					units: new foundry.data.fields.StringField({initial: "foot", label: "EH.Measurement.Units"})
					// TODO: Set default based on default units setting
				}, {label: "EH.Speed.Label"})
			})
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
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
		const listFormatter = new Intl.ListFormat(game.i18n.lang, { type: "unit" });

		// Base speed
		movements.push([this.attributes.movement.value, numberFormat(
			this.attributes.movement.value, { unit: this.attributes.movement.units }
		)]);

		// Special speeds
		for ( const [key, speed] of Object.entries(this.attributes.movement.special) ) movements.push([speed, `${
			(CONFIG.EverydayHeroes.movementTypes[key] ?? key).toLowerCase()} ${
			numberFormat(speed, { unit: this.attributes.movement.units })
		}`]);

		// Speed reduction
		if ( this.attributes.movement.reduction ) movements = movements.map(([speed, label]) => `${label} (${
			game.i18n.format("EH.Speed.WithoutReduction", {
				speed: numberFormat(speed + this.attributes.movement.reduction, { unit: this.attributes.movement.units }),
				type: CONFIG.EverydayHeroes.armorTypes[this.attributes.movement.reductionSource].label.toLowerCase()
			})
		})`);
		else movements = movements.map(a => a[1]);

		// Create the label
		this.attributes.movement.label = listFormatter.format(movements);
	}
}
