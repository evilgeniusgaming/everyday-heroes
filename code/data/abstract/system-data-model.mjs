/**
 * Data Model variant with some extra methods to support template mix-ins.
 *
 * **Note**: This uses some advanced Javascript techniques that are not necessary for most data models.
 * Please refer to the [advancement data models]{@link BaseAdvancement} for an example of a more typical usage.
 *
 * In template.json, each Actor or Item type can incorporate several templates which are chunks of data that are
 * common across all the types that use them. One way to represent them in the schema for a given Document type is to
 * duplicate schema definitions for the templates and write them directly into the Data Model for the Document type.
 * This works fine for small templates or systems that do not need many Document types but for more complex systems
 * this boilerplate can become prohibitive.
 *
 * Here we have opted to instead create a separate Data Model for each template available. These define their own
 * schemas which are then mixed-in to the final schema for the Document type's Data Model. A Document type Data Model
 * can define its own schema unique to it, and then add templates in direct correspondence to those in template.json
 * via SystemDataModel.mixin.
 *
 * @copyright Adapted from the [dnd5e system]{@link https://github.com/foundryvtt/dnd5e}
 */
export default class SystemDataModel extends foundry.abstract.DataModel {

	/** @inheritdoc */
	static _enableV10Validation = true;

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * System type that this system data model represents (e.g. "hero", "npc", "vehicle").
	 * @type {string}
	 */
	static _systemType;

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Base templates used for construction.
	 * @type {*[]}
	 * @private
	 */
	static _schemaTemplates = [];

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * A list of properties that should not be mixed-in to the final type.
	 * @type {Set<string>}
	 * @private
	 */
	static _immiscible = new Set(["length", "mixed", "name", "prototype", "migrateData", "defineSchema"]);

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		const schema = {};
		for ( const template of this._schemaTemplates ) {
			this.mergeSchema(schema, this[`${template.name}_defineSchema`]?.() ?? {});
		}
		return schema;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Merge two schema definitions together as well as possible.
	 * @param {DataSchema} a - First schema that forms the basis for the merge. *Will be mutated.*
	 * @param {DataSchema} b - Second schema that will be merged in, overwriting any non-mergeable properties.
	 * @returns {DataSchema} - Fully merged schema.
	 */
	static mergeSchema(a, b) {
		for ( const key of Object.keys(b) ) {
			if ( !(key in a) || (a[key].constructor !== b[key].constructor) ) {
				a[key] = b[key];
				continue;
			}
			const mergedOptions = foundry.utils.mergeObject(a[key].options, b[key].options);
			switch (b[key].constructor) {
				case foundry.data.fields.SchemaField:
					const fields = this.mergeSchema(a[key].fields, b[key].fields);
					Object.values(fields).forEach(f => f.parent = undefined);
					a[key] = new foundry.data.fields.SchemaField(fields, mergedOptions);
					break;
				case foundry.data.fields.ArrayField:
				case foundry.data.fields.SetField:
					const elementOptions = foundry.utils.mergeObject(a[key].element.options, b[key].element.options);
					a[key] = new b[key].constructor(new b[key].element.constructor(elementOptions), mergedOptions);
					break;
				default:
					a[key] = new b[key].constructor(mergedOptions);
			}
		}
		return a;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Mix multiple templates with the base type.
	 * @param {...*} templates - Template classes to mix.
	 * @returns {typeof SystemDataModel} - Final prepared type.
	 */
	static mixin(...templates) {
		const Base = class extends this {};
		Object.defineProperty(Base, "_schemaTemplates", {
			value: Object.seal([...this._schemaTemplates, ...templates]),
			writable: false,
			configurable: false
		});

		for ( const template of templates ) {
			let defineSchema;

			// Take all static methods and fields from template and mix in to base class
			for ( const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(template)) ) {
				if ( key === "defineSchema" ) defineSchema = descriptor;
				if ( this._immiscible.has(key) ) continue;
				Object.defineProperty(Base, key, { ...descriptor, enumerable: true });
			}

			// Take all instance methods and fields from template and mix in to base class
			for ( const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(template.prototype)) ) {
				if ( ["constructor"].includes(key) ) continue;
				Object.defineProperty(Base.prototype, key, { ...descriptor, enumerable: true });
			}

			// Copy over defineSchema with a custom name
			if ( defineSchema ) {
				Object.defineProperty(Base, `${template.name}_defineSchema`, defineSchema);
			}
		}

		return Base;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Helpers                                  */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Helper method to get all enumerable methods, inherited or own, for the provided object.
	 * @param {object} object - Source of the methods to fetch.
	 * @param {string} [startingWith] - Optional filtering string.
	 * @returns {string[]} - Array of method keys.
	 */
	static _getMethods(object, startingWith) {
		let keys = [];
		for ( const key in object ) { keys.push(key); }
		keys.push(...Object.getOwnPropertyNames(object));
		if ( startingWith ) keys = keys.filter(key => key.startsWith(startingWith));
		return keys;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Migrations                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static migrateData(source) {
		this._getMethods(this, "migrate").forEach(k => this[k](source));
		return super.migrateData(source);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare data related to this DataModel itself, before any embedded Documents or derived data is computed.
	 */
	prepareBaseData() {
		this.constructor._getMethods(this.constructor.prototype, "prepareBase").forEach(k => this[k]());
	}

	/* -------------------------------------------- */

	/**
	 * Apply transformations or derivations to the values of the source data object.
	 */
	prepareDerivedData() {
		this.constructor._getMethods(this.constructor.prototype, "prepareDerived").forEach(k => this[k]());
		if ( !this.parent.isEmbedded ) this.prepareFinalData();
	}

	/* -------------------------------------------- */

	/**
	 * Final data preparation steps performed on Items after parent actor has been fully prepared.
	 */
	prepareFinalData() {
		this.constructor._getMethods(this.constructor.prototype, "prepareFinal").forEach(k => this[k]());
	}
}
