/**
 * @typedef {DataFieldOptions} DocumentContextFieldOptions
 * @property {boolean} [foreign=false] - Does this field represent foreign rather than local documents?
 */

/**
 * Field that stores context data for local for foreign documents in a collection.
 *
 * @param {typeof Document} model - The DataModel class definition which each entry represents.
 * @param {object} schema - Schema for each context entry.
 * @param {DocumentContextFieldOptions} options - Options which configure the behavior of the field.
 */
export default class DocumentContextField extends foundry.data.fields.ObjectField {
	constructor(model, schema, options) {
		if ( !foundry.utils.isSubclass(model, foundry.abstract.DataModel) ) {
			throw new Error("DocumentContextField must have a DataModel subclass as its model.");
		}

		super(options);
		this.model = model;
		this.schema = new foundry.data.fields.SchemaField(schema);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Model type for which each entry provides context.
	 * @type {typeof Document}
	 */
	model;

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Schema that is created for each instance.
	 * @type {SchemaField}
	 */
	schema;

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static get _defaults() {
		return foundry.utils.mergeObject(super._defaults, {
			foreign: false
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_cleanType(value, options) {
		Object.entries(value).forEach(([k, v]) => value[k] = this.schema.clean(v, options));
		return value;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_validateType(value, options={}) {
		super._validateType(value, options);
		const errors = {};
		for ( const [k, v] of Object.entries(value) ) {
			const error = this.schema.validate(v, options);
			if ( error ) errors[k] = error;
		}
		if ( !foundry.utils.isEmpty(errors) ) throw new foundry.data.fields.ModelValidationError(errors);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	initialize(value, model, options={}) {
		if ( !value ) return new Collection();
		const collection = new Collection();
		for ( const [k, v] of Object.entries(value) ) {
			const data = this.schema.initialize(v, model, options);
			Object.defineProperty(data, "document", {
				get: () => {
					const base = this.options.foreign ? game : model.parent;
					const collection = base?.[this.model.metadata.collection];
					return collection?.get(k);
				},
				configurable: true
			});
			collection.set(k, data);
		}
		return collection;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	toObject(value) {
		return Object.fromEntries(value.values());
	}
}
