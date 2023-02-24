/**
 * @typedef {StringFieldOptions} FormulaFieldOptions
 * @property {boolean} [deterministic=false] - Is this formula not allowed to have dice values?
 */

/**
 * Special case StringField which represents a formula.
 *
 * @param {FormulaFieldOptions} [options={}] - Options which configure the behavior of the field.
 * @property {boolean} deterministic=false - Is this formula not allowed to have dice values?
 *
 * @copyright Adapted from the [dnd5e system]{@link https://github.com/foundryvtt/dnd5e}
 */
export default class FormulaField extends foundry.data.fields.StringField {

	/** @inheritdoc */
	static get _defaults() {
		return foundry.utils.mergeObject(super._defaults, {
			deterministic: false
		});
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	_validateType(value) {
		if ( this.options.deterministic ) {
			const roll = new Roll(value);
			if ( !roll.isDeterministic ) throw new Error("must not contain dice terms");
			Roll.safeEval(roll.formula);
		}
		else Roll.validate(value);
		super._validateType(value);
	}
}
