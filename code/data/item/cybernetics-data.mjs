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
	/** @inheritDoc */
	static get metadata() {
		return {
			type: "cybernetics",
			category: "physical",
			localization: "EH.Item.Type.Cybernetics",
			icon: "fa-solid fa-microchip",
			image: "systems/everyday-heroes/artwork/svg/items/cybernetics.svg",
			sheet: {
				application: CyberneticsSheet,
				hasDetails: true,
				hasEffects: true,
				label: "EH.Sheet.Cybernetics"
			}
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @inheritDoc */
	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			location: new StringField({ label: "EH.Cybernetics.Location" }),
			priceLower: new NumberField({ min: 0, integer: true, label: "EH.Cybernetics.PriceLower" }),
			strain: new NumberField({ initial: 0, min: 0, integer: true, label: "EH.Equipment.Trait.Strain.Label" }),
			surgeryComplexity: new StringField({ label: "EH.Cybernetics.SurgeryComplexity.Label" })
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @override */
	get npcDisplay() {
		return false;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @override */
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

	/** @override */
	static typeLabel(type, plural=false) {
		if ( !type.value ) return game.i18n.localize("EH.Item.Type.Cybernetics[one]");
		return game.i18n.format("EH.Item.Type.DetailedLabel", {
			category: CONFIG.EverydayHeroes.cyberneticsTypes[type.value]?.label ?? "",
			type: game.i18n.localize(`EH.Cybernetics.Enhancement[${plural ? "other" : "one"}]`),
			subtype: ""
		}).trim().replace("  ", " ");
	}
}
