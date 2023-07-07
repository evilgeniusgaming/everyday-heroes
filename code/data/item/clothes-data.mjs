import ItemDataModel from "../abstract/item-data-model.mjs";
import DescribedTemplate from "./templates/described-template.mjs";
import PhysicalTemplate from "./templates/physical-template.mjs";

/**
 * Data definition for Clothes items.
 * @mixes {@link DescribedTemplate}
 * @mixes {@link PhysicalTemplate}
 */
export default class ClothesData extends ItemDataModel.mixin(DescribedTemplate, PhysicalTemplate) {

	static get metadata() {
		return {
			type: "clothes",
			category: "physical",
			localization: "EH.Item.Type.Clothes",
			icon: "fa-solid fa-vest",
			image: "systems/everyday-heroes/artwork/svg/items/clothes.svg",
			advancement: {
				grantable: true
			}
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get hasDetails() {
		return false;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get isEquippable() {
		return this.actor?.type === "npc";
	}
}
