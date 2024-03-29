import ItemDataModel from "../abstract/item-data-model.mjs";
import IdentifierField from "../fields/identifier-field.mjs";
import ActivatableTemplate from "./templates/activatable-template.mjs";
import DescribedTemplate from "./templates/described-template.mjs";
import TypedTemplate from "./templates/typed-template.mjs";

/**
 * Data definition for Special Feature items.
 * @mixes {@link ActivatableTemplate}
 * @mixes {@link DescribedTemplate}
 * @mixes {@link TypedTemplate}
 */
export default class SpecialFeatureData extends ItemDataModel.mixin(
	DescribedTemplate, ActivatableTemplate, TypedTemplate
) {

	static get metadata() {
		return {
			type: "specialFeature",
			category: "feature",
			localization: "EH.Item.Type.SpecialFeature",
			icon: "fa-solid fa-users-rectangle",
			image: "systems/everyday-heroes/artwork/svg/items/feature.svg",
			advancement: {
				grantable: true
			}
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			identifier: new foundry.data.fields.SchemaField({
				value: new IdentifierField({label: "EH.Identifier.Label", hint: "EH.Identifier.Hint"})
			}),
			type: new foundry.data.fields.SchemaField({
				value: new foundry.data.fields.StringField({suggestions: CONFIG.EverydayHeroes.specialFeatureTypes})
			})
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static getCompendiumSection(index, sorting) {
		const type = foundry.utils.getProperty(index, "system.type") ?? {};
		let key;
		if ( !type.value ) key = "special-feature";
		else key = `${type.value}-special-feature`;
		return [key, {
			label: this.typeLabel(type, true),
			sort: sorting[key] ?? Infinity
		}];
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedTypeLabel() {
		this.type.label = this.constructor.typeLabel(this.type);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static typeLabel(type, plural=false) {
		return game.i18n.format("EH.Item.Type.DetailedLabel", {
			category: "",
			type: game.i18n.localize(`EH.Item.Type.SpecialFeature[${plural ? "other" : "one"}]`),
			subtype: CONFIG.EverydayHeroes.specialFeatureTypes[type.value]?.label ?? ""
		}).trim().replace("  ", " ");
	}
}
