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
export default class DocumentContextField extends foundry.data.fields.TypedObjectField {
	constructor(model, schema, options, context) {
		if ( !foundry.utils.isSubclass(model, foundry.abstract.DataModel) ) {
			throw new Error("DocumentContextField must have a DataModel subclass as its model.");
		}

		super(new foundry.data.fields.SchemaField(schema), options, context);
		this.model = model;
		this.schema = this.element;
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

	/** @inheritDoc */
	static get _defaults() {
		return foundry.utils.mergeObject(super._defaults, {
			foreign: false
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @override */
	initialize(value, model, options={}) {
		const collection = new Collection();
		if ( !value ) return collection;
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
}
