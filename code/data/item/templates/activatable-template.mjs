import FormulaField from "../../fields/formula-field.mjs";

/**
 * Data model template for an item that can be activated.
 */
export default class ActivatableTemplate extends foundry.abstract.DataModel {
	static defineSchema() {
		return {
			activation: new foundry.data.fields.SchemaField({
				type: new foundry.data.fields.StringField({label: ""}),
				condition: new foundry.data.fields.StringField({label: ""})
			}, {label: ""}),
			resource: new foundry.data.fields.SchemaField({
				amount: new foundry.data.fields.NumberField({label: ""}),
				target: new foundry.data.fields.StringField({label: ""}),
				type: new foundry.data.fields.StringField({label: ""})
			}, {label: ""}),
			uses: new foundry.data.fields.SchemaField({
				spent: new foundry.data.fields.NumberField({initial: 0, min: 0, integer: true, label: ""}),
				max: new FormulaField({deterministic: true, label: ""}),
				per: new foundry.data.fields.StringField({label: ""}),
				recovery: new FormulaField({label: ""})
			})
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
	 * Can this Item be activated?
	 * @type {boolean}
	 */
	get hasActivation() {
		return !!this.activation.type || !!this.activation.condition;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareFinalUses() {
		// TODO: Resolve max uses formula
		this.uses.available = Number(this.uses.max) - this.uses.spent;
	}
}
