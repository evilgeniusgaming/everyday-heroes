import ItemDataModel from "../abstract/item-data-model.mjs";
import AttackTemplate from "./templates/attack-template.mjs";
import BaseWeaponTemplate from "./templates/base-weapon-template.mjs";
import DamageTemplate from "./templates/damage-template.mjs";
import DescribedTemplate from "./templates/described-template.mjs";
import EquipmentTemplate from "./templates/equipment-template.mjs";
import PhysicalTemplate from "./templates/physical-template.mjs";
import TypedTemplate from "./templates/typed-template.mjs";

/**
 * Data definition for Weapon items.
 * @mixes {@link AttackTemplate}
 * @mixes {@link BaseWeaponTemplate}
 * @mixes {@link DamageTemplate}
 * @mixes {@link DescribedTemplate}
 * @mixes {@link EquipmentTemplate}
 * @mixes {@link PhysicalTemplate}
 * @mixes {@link TypedTemplate}
 */
export default class WeaponData extends ItemDataModel.mixin(
	AttackTemplate, DamageTemplate, DescribedTemplate, EquipmentTemplate,
	PhysicalTemplate, TypedTemplate, BaseWeaponTemplate
) {

	static get metadata() {
		return {
			type: "weapon",
			category: "physical",
			localization: "EH.Item.Type.Weapon",
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
			// TODO: Temporary fix for item conversion bug, find a better solution :)
			activation: new foundry.data.fields.SchemaField({}, {required: false, initial: undefined}),
			resource: new foundry.data.fields.SchemaField({}, {required: false, initial: undefined}),
			target: new foundry.data.fields.SchemaField({}, {required: false, initial: undefined}),
			uses: new foundry.data.fields.SchemaField({}, {required: false, initial: undefined})
		});
	}
}
