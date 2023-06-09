import SystemDataModel from "../abstract/system-data-model.mjs";
import DescribedTemplate from "./templates/described-template.mjs";
import PhysicalTemplate from "./templates/physical-template.mjs";
import TypedTemplate from "./templates/typed-template.mjs";

/**
 * Data definition for Gear items.
 * @mixes {@link DescribedTemplate}
 * @mixes {@link PhysicalTemplate}
 * @mixes {@link TypedTemplate}
 */
export default class GearData extends SystemDataModel.mixin(DescribedTemplate, PhysicalTemplate, TypedTemplate) {

	static get metadata() {
		return {
			type: "gear",
			category: "physical",
			localization: "EH.Item.Type.Gear",
			icon: "fa-solid fa-bag-shopping",
			image: "systems/everyday-heroes/artwork/svg/items/gear.svg",
			advancement: {
				grantable: true
			}
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static getCompendiumSection(index, sorting) {
		const type = foundry.utils.getProperty(index, "system.type") ?? {};
		const key = type.value ?? "gear";
		return [key, {
			label: CONFIG.EverydayHeroes.gearTypes[type.value]?.label,
			sort: sorting[key] ?? Infinity
		}];
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get hasDetails() {
		return false;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get isEquippable() {
		return this.parent?.actor?.type === "npc";
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedTypeLabel() {
		this.type.label = CONFIG.EverydayHeroes.gearTypes[this.type.value]?.label ?? "";
	}
}
