import VehicleModificationSheet from "../../applications/item/vehicle-modification-sheet.mjs";
import ItemDataModel from "../abstract/item-data-model.mjs";
import MappingField from "../fields/mapping-field.mjs";
import DescribedTemplate from "./templates/described-template.mjs";
import PhysicalTemplate from "./templates/physical-template.mjs";

/**
 * Data definition for vehicle modification items.
 * @mixes {@link DescribedTemplate}
 * @mixes {@link PhysicalTemplate}
 *
 * @property {Object<number>} abilities - Modifications to a vehicle's ability mods.
 * @property {number} armorValue - Override of the vehicle's body armor value.
 * @property {Set<string>} properties - Vehicle modification's properties.
 */
export default class VehicleModificationData extends ItemDataModel.mixin(DescribedTemplate, PhysicalTemplate) {

	static get metadata() {
		return {
			type: "vehicleModification",
			category: "physical",
			localization: "EH.Item.Type.VehicleModification",
			icon: "fa-solid fa-wrench",
			image: "systems/everyday-heroes/artwork/svg/items/vehicle-modification.svg",
			sheet: {
				application: VehicleModificationSheet,
				label: "EH.Sheet.VehicleModification"
			}
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			abilities: new MappingField(new foundry.data.fields.NumberField({
				nullable: false, initial: 0, integer: true, label: "EH.Ability.Modifier"
			}), {initialKeys: CONFIG.EverydayHeroes.vehicleAbilities, prepareKeys: true, label: "EH.Ability.Label[other]"}),
			armorValue: new foundry.data.fields.NumberField({
				initial: 0, min: 0, integer: true, label: "EH.Vehicle.Trait.ArmorValue.Body.Label"
			}),
			properties: new foundry.data.fields.SetField(new foundry.data.fields.StringField(), {
				label: "EH.Weapon.Property.Label"
			})
		});
	}
}
