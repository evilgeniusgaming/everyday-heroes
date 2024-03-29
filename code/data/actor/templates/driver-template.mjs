import FormulaField from "../../fields/formula-field.mjs";
import MappingField from "../../fields/mapping-field.mjs";

/**
 * Data model template for actors that can drive vehicles.
 * @mixin
 *
 * @property {object} vehicle
 * @property {ActorEH} vehicle.actor - Vehicle this person is currently driving.
 * @property {object} vehicle.bonuses
 * @property {object} vehicle.bonuses.ability - Bonuses to individual abilities.
 * @property {object} vehicle.bonuses.roll - Bonuses to specific vehicle rolls.
 */
export default class DriverTemplate extends foundry.abstract.DataModel {
	static defineSchema() {
		return {
			vehicle: new foundry.data.fields.SchemaField({
				actor: new foundry.data.fields.ForeignDocumentField(foundry.documents.BaseActor, {label: ""}),
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
				}, {label: "EH.Bonus.Label[other]", hint: "EH.Vehicle.Bonus.Hint"})
			})
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareBaseVehicle() {
		this.vehicle.isDriver = this.vehicle.actor?.system.details.driver === this.parent;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Socket Event Handlers                    */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_preCreate(data, options, user) {
		if ( !options.keepEmbeddedId ) this.parent.updateSource({"system.vehicle.actor": null});
	}
}
