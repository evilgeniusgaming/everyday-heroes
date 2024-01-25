import { numberFormat, simplifyBonus } from "../../../utils.mjs";
import FormulaField from "../../fields/formula-field.mjs";

/**
 * Data model template for an item that can be activated.
 *
 * @property {object} activation
 * @property {number} activation.amount - Number associated with activation, if applicable (e.g. 2 cinematic actions).
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
				amount: new foundry.data.fields.NumberField({
					label: "EH.Activation.Amount.Label", hint: "EH.Activation.Amount.Hint"
				}),
				type: new foundry.data.fields.StringField({
					label: "EH.Activation.Cost.Label", hint: "EH.Activation.Cost.Hint",
					suggestions: CONFIG.EverydayHeroes.actionTypesStandard
				}),
				condition: new foundry.data.fields.StringField({
					label: "EH.Activation.Condition.Label", hint: "EH.Activation.Condition.Hint"
				})
			}, {required: true, initial: {}, label: "EH.Activation.Label"}),
			resource: new foundry.data.fields.SchemaField({
				amount: new foundry.data.fields.NumberField({
					label: "EH.Consumption.Amount.Label", hint: "EH.Consumption.Amount.Hint"
				}),
				target: new foundry.data.fields.StringField({
					label: "EH.Consumption.Target.Label", hint: "EH.Consumption.Target.Hint"
				}),
				type: new foundry.data.fields.StringField({
					label: "EH.Consumption.Type.Label", hint: "EH.Consumption.Type.Hint"
				})
			}, {required: true, initial: {}, label: "EH.Consumption.Label"}),
			uses: new foundry.data.fields.SchemaField({
				spent: new foundry.data.fields.NumberField({initial: 0, min: 0, integer: true, label: "EH.Uses.Spent.Label"}),
				max: new FormulaField({
					deterministic: true, label: "EH.Uses.Max.Label", hint: "EH.Uses.Max.Hint"
				}),
				period: new foundry.data.fields.StringField({
					label: "EH.Uses.Recovery.Period.Label", hint: "EH.Uses.Recovery.Period.Hint",
					suggestions: CONFIG.EverydayHeroes.recoveryPeriods
				}),
				formula: new FormulaField({label: "EH.Uses.Recovery.Formula.Label", unused: true})
			}, {required: true, initial: {}, label: "EH.Uses.Label"})
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
	 * Is this item configured to consume cinematic actions and on an actor with them?
	 * @type {boolean}
	 */
	get consumesCinematicActions() {
		return ["action", "attack"].includes(this.activation.type)
			&& !!this.actor?.system.details?.cinematicActions?.max;
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
	 * List of consumption targets based on the current resource type.
	 * @type {object|null}
	 */
	get consumptionTargets() {
		const config = CONFIG.EverydayHeroes.consumptionTypes[this.resource.type];
		if ( !this.actor || !config || config.target === false ) return null;
		switch (this.resource.type) {
			case "resource":
				return Object.entries(this.actor.system.resources ?? {}).reduce((obj, [key, resource]) => {
					if ( !resource.disabled ) obj[key] = resource.label;
					return obj;
				}, {});
			case "uses":
				return this.actor.items.reduce((obj, item) => {
					if ( item !== this.parent && item.system.consumesUses ) obj[item.id] = item.name;
					return obj;
				}, {});
		}
		return null;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Are action points relevant to this item?
	 * @type {boolean}
	 */
	get hasActionPoints() {
		return ["action", "attack"].includes(this.activation.type) && !!this.actor?.system.details?.cinematicActions?.max;
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

	/**
	 * Should this be displayed on the details tab of an NPC sheet?
	 * @type {boolean}
	 */
	get npcDisplay() {
		return true;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Should an activation of this item consume one or more cinematic actions?
	 * @type {boolean}
	 */
	get shouldConsumeCinematicAction() {
		return this.consumesCinematicActions && this.actor?.inCombat;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Should an activation of this item consume a linked resource?
	 * @type {boolean}
	 */
	get shouldConsumeResource() {
		if ( !this.consumesResource ) return false;
		if ( this.resource.type !== "uses" ) return true;
		const otherItem = this.actor?.items.get(this.resource.target);
		return otherItem?.system.shouldConsumeUse ?? false;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Should an activation of this item consume a use?
	 * @type {boolean}
	 */
	get shouldConsumeUse() {
		const config = CONFIG.EverydayHeroes.recoveryPeriods[this.uses.period];
		return this.consumesUses && (!config?.combatOnly || this.actor?.inCombat);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareFinalResourceLabel() {
		const number = numberFormat(this.resource.amount);
		switch (this.resource.type) {
			case "resource":
				const resource = this.actor?.system.resources?.[this.resource.target];
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

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Helpers                                  */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Labels displayed after an item's name indicating how many action points it consumes, how many uses it has left,
	 * and whether it is charged.
	 * @returns {string[]}
	 */
	npcConsumptionLabels() {
		const actions = [];

		if ( this.hasActionPoints && (this.activation.amount > 1) ) actions.push(
			`${numberFormat(this.activation.amount)} ${game.i18n.format("EH.Activation.Amount.ActionPoints.Abbreviation")}`
		);

		if ( this.uses.max ) {
			if ( this.uses.period ) actions.push(`${numberFormat(this.uses.available)}/${
				CONFIG.EverydayHeroes.recoveryPeriods[this.uses.period]?.label}`);
			else actions.push(`${numberFormat(this.uses.available)}/${numberFormat(this.uses.max)}`);
		}

		if ( this.recharge?.target ) actions.push(`${
			!this.recharge.charged ? '<a data-action="roll-item" data-type="recharge">' : ""}${
			this.recharge.label}${!this.recharge.charged ? "</a>" : ""
		}`);

		return actions;
	}
}
