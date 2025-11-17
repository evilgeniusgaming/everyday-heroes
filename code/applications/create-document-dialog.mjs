const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * System specific document creation dialog with support for icons and hints for each document type.
 */
export default class CreateDocumentDialog extends HandlebarsApplicationMixin(ApplicationV2) {
	/** @override */
	static DEFAULT_OPTIONS = {
		classes: ["create-document", "everyday-heroes"],
		createData: {},
		createOptions: {},
		documentType: null,
		folders: null,
		form: {
			handler: CreateDocumentDialog.#handleFormSubmission
		},
		position: {
			width: 350
		},
		tag: "dialog",
		types: null,
		window: {
			contentTag: "form",
			contentClasses: ["standard-form"],
			minimizable: false
		}
	};

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @override */
	static PARTS = {
		content: {
			template: "systems/everyday-heroes/templates/shared/create-document-dialog.hbs"
		},
		footer: {
			template: "templates/generic/form-footer.hbs"
		}
	};

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Name of type of document being created.
	 * @type {string}
	 */
	get documentName() {
		return this.options.documentType.documentName;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Type of document being created.
	 * @type {typeof Document|typeof PseudoDocument}
	 */
	get documentType() {
		return this.options.documentType;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * The form was submitted.
	 * @type {boolean}
	 */
	#submitted = false;

	get submitted() {
		return this.#submitted;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Rendering                                */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @inheritDoc */
	async _preparePartContext(partId, context, options) {
		context = { ...(await super._preparePartContext(partId, context, options)) };
		if ( partId === "content" ) return this._prepareContentContext(context, options);
		if ( partId === "footer" ) return this._prepareFooterContext(context, options);
		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare rendering context for the content section.
	 * @param {ApplicationRenderContext} context - Context being prepared.
	 * @param {HandlebarsRenderOptions} options - Options which configure application rendering behavior.
	 * @returns {Promise<ApplicationRenderContext>}
	 * @protected
	 */
	async _prepareContentContext(context, options) {
		const { pack, parent } = this.options.createOptions;

		let collection;
		if ( !parent ) {
			if ( pack ) collection = game.packs.get(pack);
			else collection = game.collections.get(this.documentName);
		}
		context.folders = this.options.folders ?? collection?._formatFolderSelectOptions() ?? [];
		context.hasFolders = !!context.folders.length;
		context.folders.unshift({ id: "", name: game.i18n.localize("DOCUMENT.Folder"), rule: true });

		context.name = this.options.createData.name;
		context.folder = this.options.createData.folder;

		context.types = [];
		context.hasTypes = false;
		const defaultType = this.options.createData.type
			?? game.settings.get("everyday-heroes", `_lastCreateType${this.documentName}`)
			?? CONFIG[this.documentName]?.defaultType;
		const TYPES = this.documentType._createDialogTypes?.(parent) ?? this.documentType.TYPES;
		if ( TYPES?.length > 1 ) {
			if ( this.options.types?.length === 0 ) throw new Error("The array of sub-types to restrict to must not be empty");

			for ( const category of Object.values(CONFIG[this.documentName]?.categories) ) {
				for ( const type of category.types ) {
					if ( (type === CONST.BASE_DOCUMENT_TYPE) || CONFIG[this.documentName].dataModels[type]?.metadata?.hidden
						|| (this.options.types && this.options.types.includes(type)) ) continue;
					const typeData = { group: category.label, selected: type === defaultType, value: type };
					if ( this.documentType._createDialogData ) {
						Object.assign(typeData, this.documentType._createDialogData(type, parent));
					} else {
						const label = CONFIG[this.documentName]?.typeLabels?.[type];
						Object.assign(typeData, {
							icon: this.documentType.getDefaultArtwork?.({ type })?.img ?? this.documentType.DEFAULT_ICON,
							label: label && game.i18n.has(label) ? game.i18n.localize(label) : type
						});
					}
					context.types.push(typeData);
				}
			}
			if ( !context.types.length ) throw new Error("No document types were permitted to be created");
			context.hasTypes = true;
		}

		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare rendering context for the footer.
	 * @param {ApplicationRenderContext} context - Context being prepared.
	 * @param {HandlebarsRenderOptions} options - Options which configure application rendering behavior.
	 * @returns {Promise<ApplicationRenderContext>}
	 * @protected
	 */
	async _prepareFooterContext(context, options) {
		context.buttons = this.options.buttons?.map(button => ({
			...button, cssClass: button.class
		}));
		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Event Listeners and Handlers             */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle submission of the dialog using the form buttons.
	 * @this {CreateDocumentDialog}
	 * @param {Event|SubmitEvent} event - The form submission event.
	 * @param {HTMLFormElement} form - The submitted form.
	 * @param {FormDataExtended} formData - Data from the dialog.
	 */
	static async #handleFormSubmission(event, form, formData) {
		if ( !form.checkValidity() ) throw new Error(game.i18n.format("EH.Document.Warning.SelectType", {
			name: game.i18n.localize(documentType.metadata.label ?? "")
		}));
		foundry.utils.mergeObject(this.options.createData, formData.object);
		this.#submitted = true;
		await this.close();
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Life-Cycle Handlers                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @inheritDoc */
	_onRender(context, options) {
		super._onRender(context, options);
		for ( const button of this.element.querySelectorAll(".window-content button") ) {
			button.classList.add("skewed");
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Factory Methods                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prompt user for document creation.
	 * @param {typeof Document|typeof PseudoDocument} documentType - Type of document to be created.
	 * @param {object} [data={}] - Document creation data.
	 * @param {DatabaseCreateOperation} [createOptions={}] - Document creation options.
	 * @param {object} [dialogOptions={}] - Options forwarded to dialog.
	 * @param {object} [dialogOptions.ok={}] - Options for the OK button.
	 * @returns {Promise<Document>}
	 */
	static async prompt(documentType, data={}, { folders, types, ...createOptions }={}, { ok={}, ...config }={}) {
		const label = game.i18n.localize(documentType.metadata.label ?? `DOCUMENT.DND5E.${documentType.documentName}`);
		const title = game.i18n.format("DOCUMENT.Create", { type: label });

		foundry.utils.mergeObject(config, {
			createOptions, documentType, folders, types,
			createData: data,
			window: { title }
		});
		config.buttons ??= [];
		config.buttons.unshift(foundry.utils.mergeObject({
			action: "ok", label: title, icon: "fa-solid fa-check", default: true
		}, ok));

		const { promise, resolve } = Promise.withResolvers();
		const dialog = new this(config);
		dialog.addEventListener("close", event => {
			if ( !dialog.submitted ) return;
			const { createData, createOptions } = dialog.options;
			if ( !createData.folder ) delete createData.folder;
			if ( !createData.name?.trim() ) createData.name = documentType.defaultName?.({
				type: createData.type, parent: createOptions.parent, pack: createOptions.pack
			});
			else if ( documentType.documentName === "Advancement" ) createData.title = createData.name;
			game.settings.set("everyday-heroes", `_lastCreateType${documentType.documentName}`, createData.type);

			createOptions.renderSheet ??= true;
			if ( foundry.utils.isSubclass(documentType, foundry.abstract.Document) ) {
				resolve(documentType.create(createData, createOptions));
			} else {
				resolve(createOptions.parent[`create${documentType.documentName}`](createData.type, createData, createOptions));
			}
		});
		dialog.render({ force: true });
		return promise;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Helpers                                  */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle migrating options for `createDialog` to the V13 API.
	 * @param {object} createOptions
	 * @param {object} dialogOptions
	 */
	static migrateOptions(createOptions, dialogOptions) {
		const applicationOptions = {
			top: "position", left: "position", width: "position", height: "position", scale: "position", zIndex: "position",
			title: "window", id: "", classes: "", jQuery: ""
		};

		for ( const [k, v] of Object.entries(createOptions) ) {
			if ( k in applicationOptions ) {
				foundry.utils.logCompatibilityWarning("The ClientDocument.createDialog signature has changed. "
					+ "It now accepts database operation options in its second parameter, "
					+ "and options for DialogV2.prompt in its third parameter.", { since: 13, until: 15, once: true });
				const dialogOption = applicationOptions[k];
				if ( dialogOption ) foundry.utils.setProperty(dialogOptions, `${dialogOption}.${k}`, v);
				else dialogOptions[k] = v;
				delete createOptions[k];
			}
		}
	}
}
