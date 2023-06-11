/**
 * Extended version of `Compendium` to display a table of contents for journal entries.
 */
export default class TableOfContentsCompendium extends Compendium {
	constructor(...args) {
		super(...args);
		const newClass = foundry.utils.getProperty(this.collection.metadata, "flags.everyday-heroes.style");
		if ( newClass ) this.options.classes.push(newClass);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["table-of-contents"],
			template: "systems/everyday-heroes/templates/compendium/table-of-contents.hbs",
			width: 800,
			height: 950,
			resizable: true
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Context Preparation                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async getData(options={}) {
		const context = await super.getData(options);
		const documents = await this.collection.getDocuments();
		context.parts = [{ chapters: [], sort: 0 }];
		for ( const entry of documents ) {
			const type = entry.getFlag("everyday-heroes", "type");
			if ( ["part", "appendix"].includes(type) ) {
				context.parts.push({
					id: entry.id,
					name: entry.name,
					chapters: this.buildChapters(entry),
					sort: (type === "part" ? 10000 : 20000) + ((entry.getFlag("everyday-heroes", "order") ?? 0) * 100)
				});
			} else if ( type === "credits" ) {
				context.parts[0].chapters = this.buildChapters(entry).concat(context.parts[0].chapters);
			} else if ( type === "introduction" ) {
				context.parts[0].chapters = context.parts[0].chapters.concat(this.buildChapters(entry));
			}
		}
		context.parts = context.parts.sort((lhs, rhs) => lhs.sort - rhs.sort);
		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Construct chapters for a section.
	 * @param {JournalEntry} entry - Journal entry for this part.
	 * @returns {object}
	 */
	buildChapters(entry) {
		const chapters = [];
		for ( const page of entry.pages.contents.sort((lhs, rhs) => lhs.sort - rhs.sort) ) {
			const toc = page.getFlag("everyday-heroes", "toc");
			if ( toc === false || page.type !== "text" ) continue;
			chapters.push({
				entryId: entry.id,
				pageId: page.id,
				name: page.name,
				level: (foundry.utils.getType(toc) === "number" ? Number(toc) : page.title.level) + 2,
				style: page.getFlag("everyday-heroes", "toc-style")
			});
		}
		return chapters;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Action Handlers                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	activateListeners(jQuery) {
		super.activateListeners(jQuery);
		const html = jQuery[0];

		for ( const element of html.querySelectorAll("a") ) {
			element.addEventListener("click", this._onClickLink.bind(this));
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async _onClickLink(event) {
		const entryId = event.currentTarget.closest("[data-entry-id]")?.dataset.entryId;
		if ( !entryId ) return;
		const entry = await this.collection.getDocument(entryId);
		entry?.sheet.render(true, {
			pageId: event.currentTarget.closest("[data-page-id]")?.dataset.pageId
		});
	}
}
