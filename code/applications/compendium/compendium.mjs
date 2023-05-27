import { sortObjectEntries } from "../../utils.mjs";

/**
 * Extended version of `Compendium` to group items into sections.
 */
export default class CompendiumEH extends Compendium {

	/**
	 * The potential sections in the order they should appear.
	 * @type {string[]}
	 */
	static get sections() {
		const concept = [
			"archetype", "class", "archetype-talent", "class-talent", "talent",
			"background", "background-special-feature", "profession", "profession-special-feature", "special-feature",
			"plan", "trick", "feat",
			"weapon", "armor", "shield", "ammunition", "explosive"
		];
		return concept
			.concat(Object.keys(CONFIG.EverydayHeroes.gearTypes));
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["everyday-heroes-compendium"],
			template: "systems/everyday-heroes/templates/compendium/compendium.hbs"
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Context Preparation                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async getData(options={}) {
		const context = await super.getData(options);
		await this.collection.getIndex({
			fields: ["system.type.value", "system.type.category", "flags.everyday-heroes.category"]
		});
		if ( !context.index ) {
			// TODO: Temp solution for bug with V11
			context.index = this.collection.index.contents;
			context.index.sort((a, b) => (a.sort || 0) - (b.sort || 0) || a.name.localeCompare(b.name));
		}
		switch (this.collection.metadata.flags.sorting) {
			case "auto":
				context.sections = this._createAutoSections(context);
				break;
			case "manual":
				context.sections = this._createManualSections(context);
				break;
		}
		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Sort entries into different sections based on type.
	 * @param {object} context - Context being prepared.
	 * @returns {object} - Grouped sections.
	 * @private
	 */
	_createAutoSections(context) {
		const sections = {};
		const sortValues = this._sortValues(this.constructor.sections);
		for ( const item of context.index ) {
			const Type = CONFIG[this.collection.metadata.type][
				game.release.generation > 10 ? "dataModels" : "systemDataModels"][item.type];
			const [key, section] = Type.getCompendiumSection(item, sortValues);
			sections[key] ??= section;
			sections[key].index ??= [];
			sections[key].index.push(item);
		}
		return sortObjectEntries(sections, "sort");
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Sort entries into sections defined in manifest.
	 * @param {object} context - Context being prepared.
	 * @returns {object} - Grouped sections.
	 * @private
	 */
	_createManualSections(context) {
		const sections = {};
		const categories = this.collection.metadata.flags.categories ?? {};
		const sortValues = this._sortValues(Object.keys(categories));
		for ( const item of context.index ) {
			const key = foundry.utils.getProperty(item, "flags.everyday-heroes.category");
			sections[key] ??= categories[key] ?? {};
			sections[key].sort ??= sortValues[key];
			sections[key].index ??= [];
			sections[key].index.push(item);
		}
		return sortObjectEntries(sections, "sort");
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Create a mapping of keys to sorting values based on the provided iterator.
	 * @param {string[]} sections - Section keys in the desired order.
	 * @returns {Object<string, number>}
	 */
	_sortValues(sections) {
		return sections.reduce(({sortValues, last}, s) => {
			sortValues[s] = last + 1000;
			return {sortValues, last: sortValues[s]};
		}, {sortValues: {}, last: 0}).sortValues;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Action Handlers                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_onSearchFilter(event, query, rgx, html) {
		for ( const li of html.querySelectorAll(".directory-item") ) {
			const name = li.querySelector(".document-name").textContent;
			const match = rgx.test(SearchFilter.cleanQuery(name));
			li.style.display = match ? "flex" : "none";
		}
	}
}
