/**
 * Extended version of `Compendium` to display a table of contents for journal entries.
 */
export default class TableOfContentsCompendium extends foundry.applications.sidebar.apps.Compendium {
	constructor(...args) {
		super(...args);
		const newClass = foundry.utils.getProperty(this.collection.metadata, "flags.everyday-heroes.style");
		if ( newClass ) this.options.classes.push(newClass);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @override */
	static DEFAULT_OPTIONS = {
		classes: ["table-of-contents"],
		window: {
			resizable: true,
			contentTag: "article"
		},
		position: {
			width: 800,
			height: 950
		},
		actions: {
			activateEntry: this.prototype._onClickLink
		}
	};

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @override */
	static PARTS = {
		article: {
			root: true,
			template: "systems/everyday-heroes/templates/compendium/table-of-contents.hbs"
		}
	};

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Rendering                                */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @override */
	_configureRenderParts(options) {
		// Skip normal compendium render parts logic.
		return foundry.utils.deepClone(this.constructor.PARTS);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @override */
	_createContextMenus() {
		this._createContextMenu(this._getEntryContextOptions, "[data-entry-id]", { fixed: true });
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @inheritDoc */
	async _onRender(context, options) {
		await super._onRender(context, options);
		new CONFIG.ux.DragDrop({
			dragSelector: "[data-document-id]",
			dropSelector: "article",
			permissions: {
				dragstart: this._canDragStart.bind(this),
				drop: this._canDragDrop.bind(this)
			},
			callbacks: {
				dragstart: this._onDragStart.bind(this),
				drop: this._onDrop.bind(this)
			}
		}).bind(this.element);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @inheritDoc */
	async _prepareContext(options) {
		const context = await super._prepareContext(options);
		const documents = await this.collection.getDocuments();

		context.parts = [{ chapters: [], sort: 0, order: 0 }];
		const chapters = new Map();
		const parts = foundry.utils.getProperty(this.collection.metadata, "flags.everyday-heroes.parts") ?? {};
		for ( let [order, name] of Object.entries(parts) ) {
			order = Number(order);
			context.parts.push({
				name,
				chapters: [],
				sort: 10000 + (Number(order) * 100),
				order
			});
		}

		for ( const entry of documents ) {
			const type = entry.getFlag("everyday-heroes", "type");
			if ( ["part", "appendix"].includes(type) ) {
				const order = (type === "part" ? 0 : 100) + (entry.getFlag("everyday-heroes", "order") ?? 0);
				context.parts.push({
					id: entry.id,
					name: entry.name,
					chapters: [],
					sort: (type === "part" ? 10000 : 20000) + ((order ?? 0) * 100),
					order
				});
				if ( !chapters.has(order) ) chapters.set(order, []);
				chapters.get(order).push(...this.buildChapters(entry));
			} else if ( type === "chapter" ) {
				const part = entry.getFlag("everyday-heroes", "part");
				const order = entry.getFlag("everyday-heroes", "order") ?? 0;
				if ( !chapters.has(part) ) chapters.set(part, []);
				chapters.get(part).push(...this.buildChapters(entry, 10000000 * order));
			} else if ( type === "credits" ) {
				context.parts[0].chapters = this.buildChapters(entry).concat(context.parts[0].chapters);
			} else if ( type === "introduction" ) {
				context.parts[0].chapters = context.parts[0].chapters.concat(this.buildChapters(entry, 10000000));
			}
		}

		for ( const part of context.parts ) {
			part.chapters = part.chapters.concat(chapters.get(part.order) ?? []);
			part.chapters.sort((lhs, rhs) => lhs.sort - rhs.sort);
		}
		context.parts = context.parts.sort((lhs, rhs) => lhs.sort - rhs.sort);

		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Construct chapters for a section.
	 * @param {JournalEntry} entry - Journal entry for this part.
	 * @param {number} [sortModifier=0] - Amount to add to sorting value.
	 * @returns {object}
	 */
	buildChapters(entry, sortModifier=0) {
		const chapters = [];
		for ( const page of entry.pages.contents.sort((lhs, rhs) => lhs.sort - rhs.sort) ) {
			const toc = page.getFlag("everyday-heroes", "toc");
			if ( toc === false || (page.type !== "text" && toc === undefined) ) continue;
			chapters.push({
				entryId: entry.id,
				pageId: page.id,
				name: page.getFlag("everyday-heroes", "toc-name") ?? page.name,
				level: (foundry.utils.getType(toc) === "number" ? Number(toc) : page.title.level) + 2,
				style: page.getFlag("everyday-heroes", "toc-style"),
				sort: page.sort + sortModifier
			});
		}
		return chapters;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @inheritDoc */
	async _renderFrame(options) {
		const frame = await super._renderFrame(options);
		frame.dataset.compendiumId = this.collection.metadata.id;
		return frame;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Event Listeners & Handlers               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle clicking a link to a journal entry or page.
	 * @param {PointerEvent} event - The triggering click event.
	 * @param {HTMLElement} target - The action target.
	 * @protected
	 */
	async _onClickLink(event, target) {
		const entryId = target.closest("[data-entry-id]")?.dataset.entryId;
		if ( !entryId ) return;
		const entry = await this.collection.getDocument(entryId);
		entry?.sheet.render(true, {
			pageId: target.closest("[data-page-id]")?.dataset.pageId
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @inheritDoc */
	_onDragStart(event) {
		let dragData;
		if ( ui.context ) ui.context.close({animate: false});
		dragData = this._getEntryDragData(event.target.dataset.documentId);
		if ( !dragData ) return;
		event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
	}
}
