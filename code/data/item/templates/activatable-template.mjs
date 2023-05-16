import { numberFormat, simplifyBonus } from "../../../utils.mjs";
import FormulaField from "../../fields/formula-field.mjs";

/**
 * Data model template for an item that can be activated.
 *
 * @property {object} activation
 * @property {string} activation.type - The action type, if any, that is needed to activated this item.
 * @property {string} activation.condition - Conditions that must be met to activate this item.
 * @property {object} resource
 * @property {number} resource.amount - Amount of the given resource consumed on each activation.
 * @property {string} resource.target - ID or identifier of the target resource being consumed.
 * @property {string} resource.type - Whether the consumed resource is a sheet resource, item use, hit dice, etc.
 * @property {object} uses
 * @property {number} uses.spent - Number of uses that have been used.
 * @property {string} uses.max - Formula for the maximum uses.
 * @property {string} uses.period - Recovery period for this item's uses.
 * @property {string} uses.formula - Formula used for resource recovery. Blank indicates that all uses are restored.
 * @mixin
 */
export default class ActivatableTemplate extends foundry.abstract.DataModel {
	static defineSchema() {
		return {
			activation: new foundry.data.fields.SchemaField({
				type: new foundry.data.fields.StringField({label: "EH.Activation.Cost.Label"}),
				condition: new foundry.data.fields.StringField({label: "EH.Activation.Condition.Label"})
			}, {label: "EH.Activation.Label"}),
			resource: new foundry.data.fields.SchemaField({
				amount: new foundry.data.fields.NumberField({label: "EH.Consumption.Amount.Label"}),
				target: new foundry.data.fields.StringField({label: "EH.Consumption.Target.Label"}),
				type: new foundry.data.fields.StringField({label: "EH.Consumption.Type.Label"})
			}, {label: "EH.Consumption.Label"}),
			uses: new foundry.data.fields.SchemaField({
				spent: new foundry.data.fields.NumberField({initial: 0, min: 0, integer: true, label: "EH.Uses.Spent.Label"}),
				max: new FormulaField({deterministic: true, label: "EH.Uses.Max.Label"}),
				period: new foundry.data.fields.StringField({label: "EH.Uses.Recovery.Period.Label"}),
				formula: new FormulaField({label: "EH.Uses.Recovery.Formula.Label"})
			}, {label: "EH.Uses.Label"})
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Actions that will be presented with this Item on the actor sheet.
	 * @type {object[]}
	 */
	get actions() {
		const actions = [];
		if ( this.hasActivation ) actions.push({
			label: CONFIG.EverydayHeroes.actionTypesStandard[this.activation.type]
				?? game.i18n.localize("EH.Action.Type.None"),
			tooltip: this.activation.condition,
			disabled: !this.canActivate,
			data: { type: "activate" }
		});
		return actions;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Is it currently possible to activate this Item?
	 * @type {boolean}
	 */
	get canActivate() {
		// TODO: Disable activation if uses or resource are none
		return true;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Does this item consume some sort of resource?
	 * @type {boolean}
	 */
	get consumesResource() {
		return !!(this.resource.amount && this.resource.type);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Does this item consume its own uses?
	 * @type {boolean}
	 */
	get consumesUses() {
		return !!this.uses.max;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Can this Item be activated?
	 * @type {boolean}
	 */
	get hasActivation() {
		return !!this.activation.type || !!this.activation.condition || this.consumesResource || this.consumesUses;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Does this item support active effects?
	 * @type {boolean}
	 */
	get hasEffects() {
		return true;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareFinalResourceLabel() {
		const number = numberFormat(this.resource.amount);
		switch (this.resource.type) {
			case "resource":
				const resource = this.parent?.actor?.system.resources?.[this.resource.target];
				this.resource.label = game.i18n.format("EH.Resource.Consumption", {
					number, resource: resource?.label ?? this.resource.target
				});
				break;
			default:
				this.resource.label = "";
				break;
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareFinalUses() {
		try {
			this.uses.max = simplifyBonus(this.uses.max, this.parent.getRollData({ deterministic: true }));
		} catch(error) {
			console.error("Problem!", error);
			// TODO: Add sheet warnings
			this.uses.max = 0;
		}

		this.uses.available = this.uses.max - this.uses.spent;
		const period = CONFIG.EverydayHeroes.recoveryPeriods[this.uses.period];
		this.uses.label = game.i18n.format(`EH.Uses.Available${period ? "Specific" : "Generic"}.Label`, {
			available: numberFormat(this.uses.available), max: numberFormat(this.uses.max),
			period: period?.label.toLowerCase()
		});
	}
}
