import ItemDataModel from "../abstract/item-data-model.mjs";
import AttackTemplate from "./templates/attack-template.mjs";
import BaseWeaponTemplate from "./templates/base-weapon-template.mjs";
import DamageTemplate from "./templates/damage-template.mjs";
import DescribedTemplate from "./templates/described-template.mjs";
import EquipmentTemplate from "./templates/equipment-template.mjs";
import PhysicalTemplate from "./templates/physical-template.mjs";
import TypedTemplate from "./templates/typed-template.mjs";

/**
 * Data definition for integrated Vehicle weapon items.
 * @mixes {@link AttackTemplate}
 * @mixes {@link BaseWeaponTemplate}
 * @mixes {@link DamageTemplate}
 * @mixes {@link DescribedTemplate}
 * @mixes {@link EquipmentTemplate}
 * @mixes {@link PhysicalTemplate}
 * @mixes {@link TypedTemplate}
 */
export default class VehicleWeaponData extends ItemDataModel.mixin(
	AttackTemplate, DamageTemplate, DescribedTemplate, EquipmentTemplate,
	PhysicalTemplate, TypedTemplate, BaseWeaponTemplate
) {

	static get metadata() {
		return {
			type: "vehicleWeapon",
			category: "physical",
			localization: "EH.Item.Type.VehicleWeapon",
			icon: "fa-solid fa-gun",
			image: "systems/everyday-heroes/artwork/svg/items/weapon.svg",
			advancement: {
				grantable: true
			},
			variant: "weapon"
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			type: new foundry.data.fields.SchemaField({
				value: new foundry.data.fields.StringField({initial: "ranged"}),
				category: new foundry.data.fields.StringField({initial: "military"})
			}, {label: "EH.Item.Type.Label"}),

			// TODO: Temporary fix for item conversion bug, find a better solution :)
			activation: new foundry.data.fields.SchemaField({}, {required: false, initial: undefined}),
			resource: new foundry.data.fields.SchemaField({}, {required: false, initial: undefined}),
			target: new foundry.data.fields.SchemaField({}, {required: false, initial: undefined}),
			uses: new foundry.data.fields.SchemaField({}, {required: false, initial: undefined})
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get actions() {
		return this.usable ? super.actions : [];
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Can this weapon currently be fired?
	 * @type {boolean}
	 */
	get usable() {
		return this.equipped && this.actor;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get user() {
		return this.actorContext?.crewMember ?? null;
	}
}
