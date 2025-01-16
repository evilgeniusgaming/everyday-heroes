import CyberneticsSheet from "../../applications/item/cybernetics-sheet.mjs";
import ItemDataModel from "../abstract/item-data-model.mjs";
import ActivatableTemplate from "./templates/activatable-template.mjs";
import DescribedTemplate from "./templates/described-template.mjs";
import PhysicalTemplate from "./templates/physical-template.mjs";
import TypedTemplate from "./templates/typed-template.mjs";

const { NumberField, StringField } = foundry.data.fields;

export default class CyberneticsData extends ItemDataModel.mixin(
	DescribedTemplate, ActivatableTemplate, PhysicalTemplate, TypedTemplate
) {
	static get metadata() {
		return {
			type: "cybernetics",
			category: "physical",
			localization: "EH.Item.Type.Cybernetics",
			icon: "fa-solid fa-microchip",
			image: "systems/everyday-heroes/artwork/svg/items/cybernetics.svg",
			sheet: {
				application: CyberneticsSheet,
				label: "EH.Sheet.Cybernetics"
			}
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			location: new StringField(),
			priceLower: new NumberField({min: 0, integer: true}),
			strain: new NumberField({initial: 0, min: 0, integer: true}),
			surgeryComplexity: new StringField()
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get npcDisplay() {
		return false;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get types() {
		return CONFIG.EverydayHeroes.cyberneticsTypes;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedTypeLabel() {
		this.type.label = this.constructor.typeLabel(this.type);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static typeLabel(type, plural=false) {
		if ( !type.value ) return game.i18n.localize("EH.Item.Type.Cybernetics[one]");
		return game.i18n.format("EH.Item.Type.DetailedLabel", {
			category: CONFIG.EverydayHeroes.cyberneticsTypes[type.value]?.label ?? "",
			type: game.i18n.localize(`EH.Cybernetics.Enhancement[${plural ? "other" : "one"}]`),
			subtype: ""
		}).trim().replace("  ", " ");
	}
}
