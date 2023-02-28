/**
 * Data field that automatically selects the Advancement-specific configuration or value data models.
 *
 * @param {Advancement} advancementType - Advancement class to which this field belongs.
 */
export default class AdvancementDataField extends foundry.data.fields.ObjectField {
	constructor(advancementType, options={}) {
		super(options);
		this.advancementType = advancementType;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static get _defaults() {
		return foundry.utils.mergeObject(super._defaults, {required: true});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Get the DataModel definition for the specified field as defined in metadata.
	 * @returns {typeof DataModel|null} - The DataModel class, or null.
	 */
	getModel() {
		return this.advancementType.metadata?.dataModels?.[this.name];
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Get the defaults object for the specified field as defined in metadata.
	 * @returns {object}
	 */
	getDefaults() {
		return this.advancementType.metadata?.defaults?.[this.name] ?? {};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_cleanType(value, options) {
		if ( !(typeof value === "object") ) value = {};

		// Use a defined DataModel
		const cls = this.getModel();
		if ( cls ) return cls.cleanData(value, options);
		if ( options.partial ) return value;

		// Use the defined defaults
		const defaults = this.getDefaults();
		return foundry.utils.mergeObject(defaults, value, {inplace: false});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	initialize(value, model, options={}) {
		const cls = this.getModel();
		if ( cls ) return new cls(value, {parent: model, ...options});
		return foundry.utils.deepClone(value);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	toObject(value) {
		return value.toObject instanceof Function ? value.toObject(false) : foundry.utils.deepClone(value);
	}
}
