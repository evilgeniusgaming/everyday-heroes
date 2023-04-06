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
						...speedConfig, label: "EH.Speed.Label"
					}),
					special: new MappingField(new foundry.data.fields.NumberField({ ...speedConfig }), {label: ""}),
					units: new foundry.data.fields.StringField({initial: "foot", label: "EH.Measurement.Units"})
					// TODO: Set default based on default units setting
				})
			})
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedMovement() {
		this.attributes.movement.label = numberFormat(
			this.attributes.movement.value, { unit: this.attributes.movement.units }
		);

		let hasAwkwardArmor = false;
		let hasAwkwardShield = false;
		for ( const item of this.parent?.items ?? [] ) {
			if ( (item.type !== "armor") || !item.system.equipped || !item.system.properties.has("awkward") ) continue;
			if ( item.system.type.value === "armor" ) hasAwkwardArmor = true;
			else if ( item.system.type.value === "shield" ) hasAwkwardShield = true;
		}
		this.attributes.movement.reduction = 0 + (hasAwkwardArmor ? 10 : 0) + (hasAwkwardShield ? 10 : 0);
		this.attributes.movement.value -= this.attributes.movement.reduction;
		if ( this.attributes.movement.reduction ) this.attributes.movement.label = `${
			numberFormat(this.attributes.movement.value, { unit: this.attributes.movement.units })
		} (${game.i18n.format("EH.Speed.WithoutReduction", { speed: this.attributes.movement.label })})`;
	}
}
