import ItemDataModel from "../abstract/item-data-model.mjs";
import IdentifierField from "../fields/identifier-field.mjs";
import ActivatableTemplate from "./templates/activatable-template.mjs";
import DescribedTemplate from "./templates/described-template.mjs";

/**
 * Data definition for Plan items.
 * @mixes {@link ActivatableTemplate}
 * @mixes {@link DescribedTemplate}
 *
 * @property {object} identifier
 * @property {string} identifier.value - Identifier of this plan.
 * @property {string} identifier.class - Identifier for the class required to take this plan.
 */
export default class PlanData extends ItemDataModel.mixin(DescribedTemplate, ActivatableTemplate) {

	static get metadata() {
		return {
			type: "plan",
			category: "feature",
			localization: "EH.Item.Type.Plan",
			icon: "fa-solid fa-ruler",
			image: "systems/everyday-heroes/artwork/svg/items/plan-trick.svg",
			advancement: {
				grantable: true
			}
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			identifier: new foundry.data.fields.SchemaField({
				value: new IdentifierField({label: "EH.Identifier.Label", hint: "EH.Identifier.Hint"}),
				class: new IdentifierField({label: "EH.Item.Type.Class[one]", hint: "EH.Identifier.PlanClass.Hint"})
			}),
			resource: new foundry.data.fields.SchemaField({
				amount: new foundry.data.fields.NumberField({initial: 1}),
				target: new foundry.data.fields.StringField({initial: "genius"}),
				type: new foundry.data.fields.StringField({initial: "resource"})
			})
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * List of additional fields to be added to the header that allow the selection of registered items.
	 * @type {object[]}
	 */
	static get registeredFields() {
		return [{
			label: "EH.Item.Type.Class[one]",
			blankLabel: "EH.Shared",
			keyPath: "system.identifier.class",
			type: "class",
			filterCallback: e => e.system.identifier.archetype === "smart"
		}];
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get npcDisplay() {
		return false;
	}
}
