import SystemDataModel from "../abstract/system-data-model.mjs";
import FormulaField from "../fields/formula-field.mjs";
import IdentifierField from "../fields/identifier-field.mjs";
import ActivatableTemplate from "./templates/activatable-template.mjs";
import DescribedTemplate from "./templates/described-template.mjs";

/**
 * Data definition for Trick items.
 * @mixes {@link ActivatableTemplate}
 * @mixes {@link DescribedTemplate}
 *
 * @property {object} identifier
 * @property {string} identifier.value - Identifier of this trick.
 * @property {string} identifier.class - Identifier for the class required to take this trick.
 * @property {object} resource
 * @property {number} resource.dice - Number of influence dice to roll.
 * @property {string} resource.bonus - Bonus added to an influence roll.
 */
export default class TrickData extends SystemDataModel.mixin(DescribedTemplate, ActivatableTemplate) {

	static get metadata() {
		return {
			type: "trick",
			category: "feature",
			localization: "EH.Item.Type.Trick",
			icon: "fa-solid fa-ruler",
			image: "systems/everyday-heroes/artwork/svg/items/plan-trick.svg"
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			identifier: new foundry.data.fields.SchemaField({
				value: new IdentifierField({label: "EH.Identifier.Label"}),
				class: new IdentifierField({label: "EH.Item.Type.Class[one]"})
			}),
			resource: new foundry.data.fields.SchemaField({
				amount: new foundry.data.fields.NumberField({initial: 1}),
				target: new foundry.data.fields.StringField({initial: "influence"}),
				type: new foundry.data.fields.StringField({initial: "resource"}),
				dice: new foundry.data.fields.NumberField({min: 0, integer: true, label: "EH.Consumption.Dice.Label"}),
				bonus: new FormulaField({label: "EH.Bonus.Label[one]"})
			})
		});
	}
}
