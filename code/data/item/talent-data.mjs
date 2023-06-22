import ItemDataModel from "../abstract/item-data-model.mjs";
import IdentifierField from "../fields/identifier-field.mjs";
import ActivatableTemplate from "./templates/activatable-template.mjs";
import DescribedTemplate from "./templates/described-template.mjs";
import TypedTemplate from "./templates/typed-template.mjs";

/**
 * Data definition for Talent items.
 * @mixes {@link ActivatableTemplate}
 * @mixes {@link DescribedTemplate}
 * @mixes {@link TypedTemplate}
 *
 * @property {object} type
 * @property {number} type.level - Level at which this talent is granted.
 */
export default class TalentData extends ItemDataModel.mixin(DescribedTemplate, ActivatableTemplate, TypedTemplate) {

	static get metadata() {
		return {
			type: "talent",
			category: "feature",
			localization: "EH.Item.Type.Talent",
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
				value: new IdentifierField({label: "Identifier.Label"})
			}),
			type: new foundry.data.fields.SchemaField({
				level: new foundry.data.fields.NumberField({label: "EH.Level.Label[one]"})
			})
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static getCompendiumSection(index, sorting) {
		const type = foundry.utils.getProperty(index, "system.type") ?? {};
		let key;
		if ( !type.value ) key = "talent";
		else key = `${type.value}-talent`;
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
			type: game.i18n.localize(`EH.Item.Type.Talent[${plural ? "other" : "one"}]`),
			subtype: CONFIG.EverydayHeroes.talentTypes[type.value]?.label ?? ""
		}).trim().replace("  ", " ");
	}
}
