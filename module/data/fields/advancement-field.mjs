/**
 * Field that automatically prepares advancements in an {@link AdvancementCollection}.
 */
export class AdvancementField extends foundry.data.fields.ArrayField {
	initialize(value, model, options) {
		return new AdvancementCollection(model, super.initialize(value, model, options));
	}
}

/**
 * Specialized collection type for retrieving advancement pseudo-documents.
 * @param {DataModel} model - The parent DataModel to which this AdvancementCollection belongs.
 * @param {Advancement[]} entries - Initialized advancement pseudo-documents.
 */
export class AdvancementCollection extends Collection {
	constructor(model, entries) {
		super();
		this.#model = model;
		for ( const entry of entries ) {
			this.set(entry.id, entry);
			this.#types[entry.type] ??= [];
			this.#types[entry.type].push(entry);
			for ( const level of entry.levels ) {
				this.#levels[level] ??= [];
				this.#levels[level].push(entry);
			}
		}
		Object.entries(this.#levels).forEach(([lvl, data]) => data.sort((a, b) =>
			a.sortingValueForLevel(lvl).localeCompare(b.sortingValueForLevel(lvl))
		));
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * The parent DataModel to which this AdvancementCollection instance belongs.
	 * @type {DataModel}
	 * @private
	 */
	#model;

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Pre-filtered arrays of advancements per-type.
	 * @type {object}
	 * @private
	 */
	#types = {};

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Pre-filtered and -sorted arrays of advancements per-level.
	 * @type {object}
	 * @private
	 */
	#levels = {};

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Levels represented by the advancements in this collection.
	 * @type {number[]}
	 */
	get levels() {
		return Object.keys(this.#levels).map(l => Number(l));
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Return array of advancements filtered by the provided type.
	 * @param {string} type
	 * @returns {Advancement[]}
	 */
	byType(type) {
		return this.#types[type] ?? [];
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Return array of advancements filtered by level.
	 * @param {number} level
	 * @returns {Advancement[]}
	 */
	byLevel(level) {
		return this.#levels[level] ?? [];
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Convert the AdvancementCollection to an array of simple objects.
	 * @param {boolean} [source=true] - Draw data for contained Documents from the underlying data source?
	 * @returns {object[]} - The extracted array of primitive objects.
	 */
	toObject(source=true) {
		return this.map(doc => doc.toObject(source));
	}
}
