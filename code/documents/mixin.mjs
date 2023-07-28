/**
 * Mixin used to share some logic between Actor & Item documents.
 * @type {function(Class)}
 * @mixin
 */
export const DocumentMixin = Base => class extends Base {

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
