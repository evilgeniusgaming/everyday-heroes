import ItemDataModel from "../abstract/item-data-model.mjs";
import ActivatableTemplate from "./templates/activatable-template.mjs";
import DescribedTemplate from "./templates/described-template.mjs";
import TypedTemplate from "./templates/typed-template.mjs";

const { SchemaField, StringField } = foundry.data.fields;

export default class MutationData extends ItemDataModel.mixin(
	DescribedTemplate, ActivatableTemplate, TypedTemplate
) {

	static get metadata() {
		return {
			type: "mutation",
			category: "feature",
			categoryPosition: [{ after: "feat" }],
			localization: "EH.Item.Type.Mutation",
			icon: "fa-solid fa-dna",
			image: "systems/everyday-heroes/artwork/svg/items/mutation.svg",
			advancement: {
				grantable: true
			}
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			type: new SchemaField({
				value: new StringField({suggestions: CONFIG.EverydayHeroes.featTypes}),
				category: new StringField({
					initial: "cosmetic", label: "EH.Mutation.Category.Label",
					suggestions: CONFIG.EverydayHeroes.mutationCategories
				})
			})
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get types() {
		return ["beneficial", "detrimental"].includes(this.type.category) ? CONFIG.EverydayHeroes.featTypes : null;
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
			category: type.category !== "cosmetic" ? CONFIG.EverydayHeroes.featTypes[type.value]?.label ?? "" : "",
			type: game.i18n.localize(`EH.Item.Type.Mutation[${plural ? "other" : "one"}]`),
			subtype: CONFIG.EverydayHeroes.mutationCategories[type.category]?.label ?? ""
		}).trim().replace("  ", " ");
	}
}
