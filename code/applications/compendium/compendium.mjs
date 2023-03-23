import { sortObjectEntries } from "../../utils.mjs";

/**
 * Extended version of `Compendium` to group items into sections.
 */
export default class CompendiumEH extends Compendium {

	/**
	 * The potential concept sections in the order they should appear.
	 * @type {string[]}
	 */
	static conceptSections = [
		"archetype", "class", "background", "profession",
		"archetype-talent", "class-talent", "talent",
		"background-specialFeature", "profession-specialFeature", "specialFeature",
		"plan", "trick", "feat"
	];

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
		await this.collection.getIndex({ fields: ["system.type.value"] });
		// TODO: Auto-index these fields in V11
		context.sections = this._createSections(context);
		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Sort entries into different sections based on type.
	 * @param {object} context - Context being prepared.
	 * @returns {object} - Grouped sections.
	 * @private
	 */
	_createSections(context) {
		const sections = {};
		const { sortValues } = this.constructor.conceptSections.reduce(({sortValues, last}, s) => {
			sortValues[s] = last + 10;
			return {sortValues, last: sortValues[s]};
		}, {sortValues: {}, last: 0});
		for ( const item of context.index ) {
			let section;
			const typeValue = foundry.utils.getProperty(item, "system.type.value");
			if ( CONFIG.Item.systemDataModels[typeValue] ) {
				section = sections[`${typeValue}-${item.type}`] ??= {
					label: `${
						game.i18n.localize(CONFIG.Item.typeLabels[typeValue])} ${
						game.i18n.localize(CONFIG.Item.typeLabelsPlural[item.type])}`,
					index: [],
					sort: sortValues[`${typeValue}-${item.type}`] ?? Infinity
				};
			} else {
				section = sections[item.type] ??= {
					label: game.i18n.localize(CONFIG.Item.typeLabelsPlural[item.type]),
					index: [],
					sort: sortValues[item.type] ?? Infinity
				};
			}
			section.index.push(item);
		}
		return sortObjectEntries(sections, "sort");
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
