/**
 * Mixin used to share some logic between Actor & Item documents.
 * @type {function(Class)}
 * @mixin
 */
export const DocumentMixin = Base => class extends Base {

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Enrichment                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Convert a Document to some HTML display for embedding purposes.
	 * Backported version from v12, to be removed when v11 support is dropped.
	 * @param {DocumentHTMLEmbedConfig} config - Configuration for embedding behavior.
	 * @param {EnrichmentOptions} [options] - The original enrichment options for cases where the Document embed
	 *                                        content also contains text that must be enriched.
	 * @returns {Promise<HTMLElement|null>} - A representation of the Document as HTML content, or null if such a
	 *                                        representation could not be generated.
	 */
	async toEmbed(config, options={}) {
		if ( game.release.generation > 11 ) return super.toEmbed(config, options);

		const content = await this._buildEmbedHTML(config, options);
		if ( !content ) return null;
		let embed;
		if ( config.inline ) embed = await this._createInlineEmbed(content, config, options);
		else embed = await this._createFigureEmbed(content, config, options);
		if ( embed ) {
			embed.classList.add("content-embed");
			if ( config.classes ) embed.classList.add(...config.classes.split(" "));
		}
		return embed;
	}

	/* -------------------------------------------- */

	/**
	 * A method that can be overridden by subclasses to customize embedded HTML generation.
	 * Backported version from v12, to be removed when v11 support is dropped.
	 * @param {DocumentHTMLEmbedConfig} config - Configuration for embedding behavior.
	 * @param {EnrichmentOptions} [options] - The original enrichment options for cases where the Document embed
	 *                                        content also contains text that must be enriched.
	 * @returns {Promise<HTMLElement|HTMLCollection|null>} - Either a single root element to append, or a collection of
	 *                                                       elements that comprise the embedded content.
	 * @protected
	 */
	async _buildEmbedHTML(config, options={}) {
		return this.constructor.hasTypeData ? this.system.toEmbed?.(config, options) ?? null : null;
	}

	/* -------------------------------------------- */

	/**
	 * A method that can be overridden by subclasses to customize inline embedded HTML generation.
	 * @param {HTMLElement|HTMLCollection} content - The embedded content.
	 * @param {DocumentHTMLEmbedConfig} config - Configuration for embedding behavior.
	 * @param {EnrichmentOptions} [options] - The original enrichment options for cases where the Document embed
	 *                                        content also contains text that must be enriched.
	 * @returns {Promise<HTMLElement|null>}
	 * @protected
	 */
	async _createInlineEmbed(content, { cite, caption, label }, options) {
		const section = document.createElement("section");
		if ( content instanceof HTMLCollection ) section.append(...content);
		else section.append(content);
		if ( label && section.children[0] ) {
			const firstElement = section.children[0];
			firstElement.innerHTML = `<strong>${label}.</strong> ${firstElement.innerHTML}`;
		}
		return section;
	}

	/* -------------------------------------------- */

	/**
	 * A method that can be overridden by subclasses to customize the generation of the embed figure.
	 * Backported version from v12, to be removed when v11 support is dropped.
	 * @param {HTMLElement|HTMLCollection} content - The embedded content.
	 * @param {DocumentHTMLEmbedConfig} config - Configuration for embedding behavior.
	 * @param {EnrichmentOptions} [options] - The original enrichment options for cases where the Document embed
	 *                                        content also contains text that must be enriched.
	 * @returns {Promise<HTMLElement|null>}
	 * @protected
	 */
	async _createFigureEmbed(content, { cite, caption, label }, options) {
		const figure = document.createElement("figure");
		if ( content instanceof HTMLCollection ) figure.append(...content);
		else figure.append(content);
		if ( cite || caption ) {
			const figcaption = document.createElement("figcaption");
			if ( caption ) figcaption.innerHTML += `<strong class="embed-caption">${label || this.name}</strong>`;
			if ( cite ) figcaption.innerHTML += `<cite>${this.toAnchor().outerHTML}</cite>`;
			figure.append(figcaption);
		}
		return figure;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Socket Event Handlers                    */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async _preCreate(data, options, user) {
		let allowed = await super._preCreate(data, options, user);
		if ( allowed !== false ) allowed = await this.system._preCreate?.(data, options, user);
		return allowed;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async _preUpdate(changed, options, user) {
		let allowed = await super._preUpdate(changed, options, user);
		if ( allowed !== false ) allowed = await this.system._preUpdate?.(changed, options, user);
		return allowed;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async _preDelete(options, user) {
		let allowed = await super._preDelete(options, user);
		if ( allowed !== false ) allowed = await this.system._preDelete?.(options, user);
		return allowed;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_onCreate(data, options, userId) {
		super._onCreate(data, options, userId);
		this.system._onCreate?.(data, options, userId);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_onUpdate(changed, options, userId) {
		super._onUpdate(changed, options, userId);
		this.system._onUpdate?.(changed, options, userId);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_onDelete(options, userId) {
		super._onDelete(options, userId);
		this.system._onDelete?.(options, userId);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Importing and Exporting                  */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static async createDialog(data={}, {parent=null, pack=null, ...options}={}) {

		// Collect data
		const documentName = this.metadata.name;
		const types = foundry.utils.deepClone(game.documentTypes[documentName].filter(t => t !== CONST.BASE_DOCUMENT_TYPE));
		const folders = parent ? [] : game.folders.filter(f => (f.type === documentName) && f.displayed);
		const label = game.i18n.localize(this.metadata.label);
		const title = game.i18n.format("DOCUMENT.Create", {type: label});

		const selectedType = data.type ?? game.settings.get("everyday-heroes", `_lastCreateType${documentName}`)
			?? CONFIG[documentName]?.defaultType ?? types[0];

		const categories = {};
		for ( const [key, value] of Object.entries(CONFIG[documentName]?.categories) ) {
			categories[key] = { label: value.label, children: {} };
			for ( const type of value.types ) {
				categories[key].children[type] = {
					label: game.i18n.localize(CONFIG[documentName]?.typeLabels?.[type] ?? type),
					chosen: type === selectedType
				};
			}
		}

		// Render the document creation form
		const html = await renderTemplate("systems/everyday-heroes/templates/item/dialogs/item-create.hbs", {
			folders,
			name: data.name || game.i18n.format("DOCUMENT.New", {type: label}),
			folder: data.folder,
			hasFolders: folders.length >= 1,
			type: selectedType,
			categories
		});

		// Render the confirmation dialog window
		return Dialog.prompt({
			title: title,
			content: html,
			label: title,
			callback: html => {
				const form = html[0].querySelector("form");
				const fd = new FormDataExtended(form);
				foundry.utils.mergeObject(data, fd.object, {inplace: true});
				if ( !data.folder ) delete data.folder;
				if ( types.length === 1 ) data.type = types[0];
				if ( !data.name?.trim() ) data.name = this.defaultName();
				game.settings.set("everyday-heroes", `_lastCreateType${documentName}`, data.type);
				return this.create(data, {parent, pack, renderSheet: true});
			},
			rejectClose: false,
			options
		});
	}
};
