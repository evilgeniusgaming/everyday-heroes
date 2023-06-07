// import FormulaField from "../../fields/formula-field.mjs";

/**
 * Data model template for actors that can drive vehicles.
 * @mixin
 */
export default class DriverTemplate extends foundry.abstract.DataModel {
	static defineSchema() {
		return {
			vehicle: new foundry.data.fields.SchemaField({
				actor: new foundry.data.fields.ForeignDocumentField(foundry.documents.BaseActor, {idOnly: true})
			})
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareBaseVehicle() {
		const actor = game.actors.get(this._source.vehicle.actor);
		if ( actor ) this.vehicle.actor = actor;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareFinalVehicle() {
		this.vehicle.actor?.system.prepareFinalData();
	}
}
