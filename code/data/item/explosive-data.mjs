import ItemDataModel from "../abstract/item-data-model.mjs";
import AttackTemplate from "./templates/attack-template.mjs";
import BaseExplosiveTemplate from "./templates/base-explosive-template.mjs";
import DamageTemplate from "./templates/damage-template.mjs";
import DescribedTemplate from "./templates/described-template.mjs";
import EquipmentTemplate from "./templates/equipment-template.mjs";
import PhysicalTemplate from "./templates/physical-template.mjs";
import TypedTemplate from "./templates/typed-template.mjs";

/**
 * Data definition for Explosive items.
 * @mixes {@link AttackTemplate}
 * @mixes {@link BaseExplosiveTemplate}
 * @mixes {@link DamageTemplate}
 * @mixes {@link DescribedTemplate}
 * @mixes {@link EquipmentTemplate}
 * @mixes {@link PhysicalTemplate}
 * @mixes {@link TypedTemplate}
 */
export default class ExplosiveData extends ItemDataModel.mixin(
	AttackTemplate, DamageTemplate, DescribedTemplate, EquipmentTemplate,
	PhysicalTemplate, TypedTemplate, BaseExplosiveTemplate
) {

	static get metadata() {
		return {
			type: "explosive",
			category: "physical",
			localization: "EH.Item.Type.Explosive",
			icon: "fa-solid fa-burst",
			image: "systems/everyday-heroes/artwork/svg/items/explosive.svg",
			advancement: {
				grantable: true
			},
			variant: "explosive"
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			// TODO: Temp workaround until a solution for a bug with adding top-level fields to the schema
			// in subclasses is found (this fixes a bug with NPCExplosive)
			activation: new foundry.data.fields.SchemaField({}, {required: false, initial: undefined}),
			range: new foundry.data.fields.SchemaField({}, {required: false, initial: undefined}),
			resource: new foundry.data.fields.SchemaField({}, {required: false, initial: undefined}),
			uses: new foundry.data.fields.SchemaField({}, {required: false, initial: undefined})
		});
	}
}
