import FormulaField from "../../fields/formula-field.mjs";
import MappingField from "../../fields/mapping-field.mjs";

/**
 * Data model template for actors that can drive vehicles.
 * @mixin
 */
export default class DriverTemplate extends foundry.abstract.DataModel {
	static defineSchema() {
		return {
			vehicle: new foundry.data.fields.SchemaField({
				actor: new foundry.data.fields.ForeignDocumentField(foundry.documents.BaseActor, {idOnly: true}),
				bonuses: new foundry.data.fields.SchemaField({
					ability: new MappingField(new FormulaField({deterministic: true}), {
						label: game.i18n.format("EH.Vehicle.Bonus.LabelSpecific[other]", {
							type: game.i18n.localize("EH.Ability.Label[one]")
						})
					}),
					roll: new MappingField(new FormulaField(), {
						label: game.i18n.format("EH.Vehicle.Bonus.LabelSpecific[other]", {
							type: game.i18n.localize("EH.Dice.Action.Roll")
						})
					})
				}, {label: "EH.Bonus.Label[other]"})
			})
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareBaseVehicle() {
		const actor = game.actors.get(this._source.vehicle.actor);
		if ( actor ) this.vehicle.actor = actor;
		this.vehicle.isDriver = actor?.system.details.driver === this.parent.id;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareFinalVehicle() {
		if ( !this.vehicle.isDriver ) return;
		this.vehicle.actor?.system.prepareFinalData();
		this.vehicle.actor?.render();
	}
}
