import { sortConcept } from "./compendium-groups.mjs";

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

	async getData(options={}) {
		const context = await super.getData(options);
		await this.collection.getIndex({ fields: ["system.type.value"] });
		// TODO: Auto-index these fields in V11

		context.sections = {};
		for ( const item of context.index ) {
			const section = sortConcept(item);
			context.sections[section.id] ??= { label: section.label, index: [] };
			context.sections[section.id].index.push(item);
		}

		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_onSearchFilter(event, query, rgx, html) {
		for ( const li of html.querySelectorAll(".directory-item") ) {
			const name = li.querySelector(".document-name").textContent;
			const match = rgx.test(SearchFilter.cleanQuery(name));
			li.style.display = match ? "flex" : "none";
		}
	}
}
