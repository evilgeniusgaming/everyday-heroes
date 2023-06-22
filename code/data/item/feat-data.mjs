import ItemDataModel from "../abstract/item-data-model.mjs";
import IdentifierField from "../fields/identifier-field.mjs";
import ActivatableTemplate from "./templates/activatable-template.mjs";
import AdvancementTemplate from "./templates/advancement-template.mjs";
import DescribedTemplate from "./templates/described-template.mjs";
import TypedTemplate from "./templates/typed-template.mjs";

/**
 * Data definition for Feat items.
 * @mixes {@link ActivatableTemplate}
 * @mixes {@link AdvancementTemplate}
 * @mixes {@link DescribedTemplate}
 * @mixes {@link TypedTemplate}
 *
 * @property {object} type
 * @property {string} type.category - Specific category of feat (basic, advanced, multiclass).
 */
export default class FeatData extends ItemDataModel.mixin(
	DescribedTemplate, ActivatableTemplate, AdvancementTemplate, TypedTemplate
) {

	static get metadata() {
		return {
			type: "feat",
			category: "feature",
			localization: "EH.Item.Type.Feat",
			icon: "fa-solid fa-house-user",
			image: "systems/everyday-heroes/artwork/svg/items/feature.svg"
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			identifier: new foundry.data.fields.SchemaField({
				value: new IdentifierField({label: "Identifier.Label"})
			}),
			type: new foundry.data.fields.SchemaField({
				category: new foundry.data.fields.StringField({label: ""})
			})
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static getCompendiumSection(index, sorting) {
		const type = foundry.utils.getProperty(index, "system.type") ?? {};
		const sort = {
			"basic-feat": 0,
			"advanced-minor-feat": 100,
			"advanced-major-feat": 200,
			"multiclass-feat": 300
		};
		let key;
		if ( !type.category ) key = "feat";
		else if ( type.category === "advanced" ) key = `advanced-${type.value}-feat`;
		else key = `${type.category}-feat`;
		return [key, {
			label: this.typeLabel(type, true),
			sort: sorting.feat + (sort[key] ?? 900)
		}];
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedTypeLabel() {
		this.type.label = this.constructor.typeLabel(this.type);
		// TODO: Multiclass feats should display like "Strong Hero Multiclass Feat"
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static typeLabel(type, plural=false) {
		return game.i18n.format("EH.Item.Type.DetailedLabel", {
			category: CONFIG.EverydayHeroes.featCategories[type.category]?.label ?? "",
			type: game.i18n.localize(`EH.Item.Type.Feat[${plural ? "other" : "one"}]`),
			subtype: type.category === "advanced" ? CONFIG.EverydayHeroes.featTypes[type.value]?.label ?? "" : ""
		}).trim().replace("  ", " ");
	}
}

// TODO: Add restrictions
//  - Can you take this feat multiple times?
//  - What other archetype, class, or feat does this feat require?
//  - Minimum level required to take the feat
//  - Minimum ability score required to take the feat
