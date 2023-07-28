import { sortObjectEntries } from "../../utils.mjs";

/**
 * Extended version of `Compendium` to group items into sections.
 */
export default class CompendiumEH extends Compendium {

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
		if ( !context.index ) context.index = this.collection.index.contents;
		context.index = Array.from(context.index).sort((a, b) =>
			(a.sort || 0) - (b.sort || 0) || a.name.localeCompare(b.name)
		);
		switch (this.collection.metadata.flags["everyday-heroes"].sorting) {
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
		const sortValues = this._sortValues(CONFIG.EverydayHeroes.itemCompendiumSections);
		for ( const item of context.index ) {
			const Type = CONFIG[this.collection.metadata.type].dataModels[item.type];
			if ( !Type ) continue;
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
		const categories = foundry.utils.deepClone(this.collection.metadata.flags["everyday-heroes"].categories ?? {});
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
			const name = li.querySelector(".entry-name").textContent;
			const match = rgx.test(SearchFilter.cleanQuery(name));
			li.style.display = match ? "flex" : "none";
		}
	}
}
