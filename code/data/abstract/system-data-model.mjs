import MappingField from "../fields/mapping-field.mjs";

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

	/**
	 * Metadata that describes a system data type.
	 *
	 * @typedef {object} SystemDataMetadata
	 * @property {string} type - Name of type to which this system data model belongs.
	 * @property {string} [module] - For module-defined types, which module provides this type.
	 * @property {string} [category] - Which category in the create item dialog should this Document be listed?
	 * @property {string} localization - Base localization key for this type. This should be a localization key that
	 *                                   accepts plural types (e.g. `EH.Item.Type.Weapon` becomes
	 *                                   `EH.Item.Type.Weapon[few]` and `EH.Item.Type.Weapon[other]`).
	 * @property {string} [icon] - Font awesome icon string used for links to this type.
	 * @property {string} [image] - Default image used when creating a Document of this type.
	 */

	/**
	 * Metadata that describes a type.
	 * @type {SystemDataMetadata}
	 */
	static metadata = {};

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

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

	/**
	 * Produce a compendium section in which this item should appear.
	 * @param {object} index - Index data for an item of this type.
	 * @param {object} sorting - Pre-generated sorting orders for primary types.
	 * @returns {[string, CompendiumSectionData]}
	 */
	static getCompendiumSection(index, sorting) {
		return [this.metadata.type, {
			label: game.i18n.localize(`${this.metadata.localization}[other]`),
			sort: sorting[this.metadata.type] ?? Infinity
		}];
	}

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
					const ElementType = (b[key].element || a[key].element).constructor;
					a[key] = new b[key].constructor(new ElementType(elementOptions), mergedOptions);
					break;
				case MappingField:
					mergedOptions.extraFields = this.mergeSchema(
						a[key].options.extraFields ?? {}, b[key].options.extraFields ?? {}
					);
					const modelOptions = foundry.utils.mergeObject(a[key].model.options, b[key].model.options);
					const ModelType = (b[key].model || a[key].model).constructor;
					a[key] = new b[key].constructor(new ModelType(modelOptions), mergedOptions);
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

	/**
	 * Determine whether this class mixes in a specific template.
	 * @param {*} template
	 * @returns {boolean}
	 */
	static mixes(template) {
		if ( foundry.utils.getType(template) === "string" ) {
			return this._schemaTemplates.find(t => t.name === template) !== undefined;
		} else {
			return this._schemaTemplates.includes(template);
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Helpers                                  */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Helper method to get all enumerable methods, inherited or own, for this class.
	 * @param {object} options
	 * @param {string} [options.startingWith] - Optional filtering string.
	 * @param {string} [options.notEndingWith] - Exclude any method that ends with this suffix.
	 * @param {boolean} [options.prototype=true] - Whether the prototype should be checked or the class.
	 * @returns {string[]} - Array of method keys.
	 */
	static _getMethods({ startingWith, notEndingWith, prototype=true }) {
		let keys = [];
		for ( const key in (prototype ? this.prototype : this) ) { keys.push(key); }
		for ( let cls of [this, ...foundry.utils.getParentClasses(this)].reverse() ) {
			if ( ["Base", "SystemDataModel", "DataModel"].includes(cls.name) ) continue;
			if ( prototype ) cls = cls.prototype;
			keys.push(...Object.getOwnPropertyNames(cls));
		}
		if ( startingWith ) keys = keys.filter(key => key.startsWith(startingWith));
		if ( notEndingWith ) keys = keys.filter(key => !key.endsWith(notEndingWith));
		return keys;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Migrations                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static migrateData(source) {
		this._getMethods({ startingWith: "migrate", notEndingWith: "Data", prototype: false }).forEach(k => this[k](source));
		return super.migrateData(source);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare data related to this DataModel itself, before any embedded Documents or derived data is computed.
	 */
	prepareBaseData() {
		this.constructor._getMethods({ startingWith: "prepareBase", notEndingWith: "Data" }).forEach(k => this[k]());
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare data that needs to be prepared after embedded documents have been prepared,
	 * but before active effects are applied.
	 */
	prepareEmbeddedData() {
		this.constructor._getMethods({ startingWith: "prepareEmbedded", notEndingWith: "Data" }).forEach(k => this[k]());
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Apply transformations or derivations to the values of the source data object.
	 */
	prepareDerivedData() {
		this.constructor._getMethods({ startingWith: "prepareDerived", notEndingWith: "Data" }).forEach(k => this[k]());
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Socket Event Handlers                    */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Pre-creation logic for this system data.
	 * @param {object} data - The initial data object provided to the document creation request.
	 * @param {object} options - Additional options which modify the creation request.
	 * @param {User} user - The User requesting the document creation.
	 * @protected
	 */
	async _preCreate(data, options, user) {}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Pre-update logic for this system data.
	 * @param {object} changed - The differential data that is changed relative to the documents prior values.
	 * @param {object} options - Additional options which modify the update request.
	 * @param {User} user - The User requesting the document update.
	 * @protected
	 */
	async _preUpdate(changed, options, user) {}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Pre-deletion logic for this system data.
	 * @param {object} options - Additional options which modify the deletion request.
	 * @param {User} user - The User requesting the document deletion.
	 * @protected
	 */
	async _preDelete(options, user) {}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Post-creation logic for this system data.
	 * @param {object} data - The initial data object provided to the document creation request.
	 * @param {object} options - Additional options which modify the creation request.
	 * @param {string} userId - The id of the User requesting the document update.
	 * @protected
	 */
	_onCreate(data, options, userId) {}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Post-update logic for this system data.
	 * @param {object} changed - The differential data that was changed relative to the documents prior values.
	 * @param {object} options - Additional options which modify the update request.
	 * @param {string} userId - The id of the User requesting the document update.
	 * @protected
	 */
	_onUpdate(changed, options, userId) {}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Post-deletion logic for this system data.
	 * @param {object} options - Additional options which modify the deletion request
	 * @param {string} userId - The id of the User requesting the document update
	 * @protected
	 */
	_onDelete(options, userId) {}

}
