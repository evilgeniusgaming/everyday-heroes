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
			"archetype", "class", "background", "profession",
			"archetype-talent", "class-talent", "talent",
			"background-specialFeature", "profession-specialFeature", "specialFeature",
			"plan", "trick", "feat"
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
		// TODO: Auto-index these fields in V11
		await this.collection.getIndex({ fields: ["system.type.value"] });
		if ( !context.index ) {
			// TODO: Temp solution for bug with V11
			context.index = this.collection.index.contents;
			context.index.sort((a, b) => (a.sort || 0) - (b.sort || 0) || a.name.localeCompare(b.name));
		}
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
		const { sortValues } = this.constructor.sections.reduce(({sortValues, last}, s) => {
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
			} else if ( item.type === "gear" ) {
				// TODO: Use plural forms
				section = sections[typeValue] ??= {
					label: CONFIG.EverydayHeroes.gearTypes[typeValue]?.label,
					index: [],
					sort: sortValues[typeValue] ?? Infinity
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
