import SystemDataModel from "../abstract/system-data-model.mjs";
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
export default class TalentData extends SystemDataModel.mixin(DescribedTemplate, ActivatableTemplate, TypedTemplate) {

	static get metadata() {
		return {
			type: "talent",
			category: "feature",
			localization: "EH.Item.Type.Talent",
			icon: "fa-solid fa-users-rectangle",
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
				level: new foundry.data.fields.NumberField({label: "EH.Level.Label[one]"})
			})
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedTypeLabel() {
		this.type.label = game.i18n.format("EH.Item.Type.DetailedLabel", {
			category: "",
			type: game.i18n.localize("EH.Item.Type.Talent[one]"),
			subtype: CONFIG.EverydayHeroes.talentTypes[this.type.value]?.label ?? ""
		}).trim();
	}
}
