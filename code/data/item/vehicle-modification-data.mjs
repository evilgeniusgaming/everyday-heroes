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
			}), {
				initialKeys: CONFIG.EverydayHeroes.vehicleAbilities, prepareKeys: true,
				label: "EH.VehicleModification.Ability.Label", hint: "EH.VehicleModification.Ability.Hint"
			}),
			armorValue: new foundry.data.fields.NumberField({
				initial: 0, min: 0, integer: true,
				label: "EH.VehicleModification.ArmorValue.Label", hint: "EH.VehicleModification.ArmorValue.Hint"
			}),
			properties: new foundry.data.fields.SetField(new foundry.data.fields.StringField(), {
				label: "EH.Equipment.Property.Label[other]", suggestions: CONFIG.EverydayHeroes.applicableProperties.vehicleModification
			})
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Helpers                                  */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Apply this item's modifications to the provided vehicle's data.
	 * @param {VehicleData} target - System data to which to apply the modifications.
	 */
	applyModifications(target) {
		for ( const [key, mod] of Object.entries(this.abilities) ) {
			if ( !mod ) continue;
			target.abilities[key].mod += mod;
		}
		target.attributes.armor.value = Math.max(target.attributes.armor.value, this.armorValue);
	}
}
