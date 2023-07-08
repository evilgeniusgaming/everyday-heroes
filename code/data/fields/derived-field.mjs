/**
 * Field that derives its value from other data, but does not save to the database.
 *
 * @property {Function} deriver - Function from which the method derives its value.
 */
export default class DerivedField extends foundry.data.fields.DataField {
	constructor(deriver, options) {
		if ( foundry.utils.getType(deriver) !== "function" ) {
			throw new Error("DerivedField must be provided with a method from which to derive its value.");
		}

		super(options);
		this.deriver = deriver;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Function from which the method derives its value.
	 * @type {Function}
	 */
	deriver;

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_cast(value) {
		return undefined;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	initialize(value, model, options={}) {
		return () => this.deriver(model);
	}
}
