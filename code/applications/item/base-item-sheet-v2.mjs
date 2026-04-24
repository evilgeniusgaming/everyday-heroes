import ActiveEffectEH from "../../documents/active-effect.mjs";
import Advancement from "../../documents/advancement/advancement.mjs";
import { createFormOptions, objectToSet } from "../../utils.mjs";
import AdvancementManager from "../advancement/advancement-manager.mjs";
import AdvancementMigrationDialog from "../advancement/advancement-migration-dialog.mjs";
import AdvancementSelection from "../advancement/advancement-selection.mjs";
import EHDocumentSheet from "../api/document-sheet.mjs";
import PrimarySheetMixin from "../api/primary-sheet-mixin.mjs";

/**
 * Base sheet that provides common features for all items.
 */
export default class BaseItemSheetV2 extends PrimarySheetMixin(EHDocumentSheet) {

	/** @override */
	static DEFAULT_OPTIONS = {
		actions: {
			modifyAdvancementChoices: BaseItemSheetV2.#onModifyAdvancementChoices,
			toggleAdvancementConfiguration: BaseItemSheetV2.#onToggleAdvancementConfiguration
		},
		classes: ["item"],
		form: {
			submitOnChange: true
		},
		position: {
			width: 570
		},
		window: {
			resizable: true
		}
	};

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @override */
	static PARTS = {
		header: {
			template: "systems/everyday-heroes/templates/item/header.hbs"
		},
		advancement: {
			container: { classes: ["item-main", "scrollable"], id: "main" },
			template: "systems/everyday-heroes/templates/item/tabs/advancement.hbs",
			visible: this.hasAdvancementTab.bind(this)
		},
		description: {
			container: { classes: ["item-main", "scrollable"], id: "main" },
			template: "systems/everyday-heroes/templates/item/tabs/description.hbs"
		},
		details: {
			container: { classes: ["item-main", "scrollable"], id: "main" },
			template: "systems/everyday-heroes/templates/item/tabs/details.hbs",
			visible: this.hasDetailsTab.bind(this)
		},
		effects: {
			container: { classes: ["item-main", "scrollable"], id: "main" },
			template: "systems/everyday-heroes/templates/item/tabs/effects.hbs",
			visible: this.hasEffectsTab.bind(this)
		}
	};

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @override */
	static TABS = {
		sheet: {
			tabs: [
				{ id: "description", label: "EH.Sheet.Section.Description" },
				{ id: "details", label: "EH.Sheet.Section.Details" },
				{ id: "advancement", label: "EH.Sheet.Section.Advancement" },
				{ id: "effects", label: "EH.Sheet.Section.Effects" }
			],
			initial: "description"
		}
	};

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Fields that will be enriched during data preparation.
	 * @type {object}
	 */
	static enrichedFields = {
		description: "description.value",
		chat: "description.chat"
	};

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * The Actor owning the item, if any.
	 * @type {EHActor}
	 */
	get actor() {
		return this.document.actor;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Whether advancements on embedded items should be configurable.
	 * @type {boolean}
	 */
	advancementConfigurable = false;

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Which editor is currently visible on the biography tab.
	 * @type {object}
	 */
	editor = {
		options: {
			description: { keyPath: "description.value", label: "EH.Item.Description.Label" },
			chat: { keyPath: "description.chat", label: "EH.Item.Description.Chat.Label" }
		},
		selected: "description"
	};

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * The Item document managed by this sheet.
	 * @type {EHItem}
	 */
	get item() {
		return this.document;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Rendering                                */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @inheritDoc */
	async _prepareContext(options) {
		context = await super._prepareContext(options);
		context.item = this.item;
		context.source = context.editable ? this.item.system._source : this.item.system;
		context.system = this.item.system;
		context.systemFields = this.item.system.schema.fields;

		await this.item.system.getSheetData?.(context);

		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @inheritDoc */
	async _preparePartContext(partId, context, options) {
		context = await super._preparePartContext(partId, context, options);
		switch ( partId ) {
			case "advancement": context = await this._prepareAdvancementContext(context, options); break;
			case "description": context = await this._prepareDescriptionContext(context, options); break;
			case "details": context = await this._prepareDetailsContext(context, options); break;
			case "effects": context = await this._prepareEffectsContext(context, options); break;
			case "header":
				context = await this._prepareHeaderContext(context, options);
				for ( const config of this.item.system.constructor.registeredFields ?? [] ) {
					context.headerFields.push(this._createFormField(context, config.keyPath.replace("system.", ""), {
						hint: false,
						options: createFormOptions(
							await CONFIG.EverydayHeroes.registration.filter(config.type, config.filterCallback),
							{ blank: config.blankLabel ? _loc(config.blankLabel) : false }
						)
					}));
				}
				break;
		}
		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare rendering context for the advancement tab.
	 * @param {ApplicationRenderContext} context - Context being prepared.
	 * @param {HandlebarsRenderOptions} options - Options which configure application rendering behavior.
	 * @returns {ApplicationRenderContext}
	 * @protected
	 */
	async _prepareAdvancementContext(context, options) {
		const configMode = this.advancementConfigurable || !this.item.isEmbedded;
		context.advancement = {};
		context.advancementEditable = configMode && context.editable;
		const maxLevel = this.item.parent?.system.details.level ?? -1;

		// Improperly configured advancements
		const needingConfiguration = this.item.system.advancement.filter(a => !a.levels.length);
		if ( needingConfiguration.length ) {
			context.advancement.unconfigured = {
				items: needingConfiguration.map(a => ({
					id: a.id,
					uuid: a.uuid,
					order: a.constructor.order,
					title: a.title,
					icon: a.icon,
					configured: false
				})),
				configured: "partial"
			};
		}

		// All other advancements by level
		for ( const level of this.item.system.advancement.levels ) {
			const advancements = this.item.system.advancement.byLevel(level);
			const items = advancements.map(a => ({
				id: a.id,
				uuid: a.uuid,
				order: a.sortingValueForLevel(level),
				title: a.titleForLevel(level, { configMode }),
				icon: a.icon,
				summary: a.summaryForLevel(level, { configMode }),
				configured: a.configuredForLevel(level)
			}));
			if ( !items.length ) continue;
			context.advancement[level] = {
				items: items.sort((a, b) => a.order.localeCompare(b.order)),
				configured: (level > maxLevel) ? false : items.some(a => !a.configured) ? "partial" : "full"
			};
		}

		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare rendering context for the description tab.
	 * @param {ApplicationRenderContext} context - Context being prepared.
	 * @param {HandlebarsRenderOptions} options - Options which configure application rendering behavior.
	 * @returns {ApplicationRenderContext}
	 * @protected
	 */
	async _prepareDescriptionContext(context, options) {
		const editorKeyPath = this.editor.options[this.editor.selected].keyPath;
		const enrichmentContext = {
			secrets: this.item.isOwner, rollData: this.item.getRollData(), relativeTo: this.item
		};
		context.editor = {
			enriched: await foundry.applications.ux.TextEditor.implementation.enrichHTML(
				foundry.utils.getProperty(context.system, editorKeyPath), enrichmentContext
			),
			name: `system.${editorKeyPath}`,
			options: Object.entries(this.editor.options).map(([value, { label }]) => ({ value, label: _loc(label) })),
			selected: this.editor.selected,
			value: foundry.utils.getProperty(context.source, editorKeyPath)
		};

		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare rendering context for the details tab.
	 * @param {ApplicationRenderContext} context - Context being prepared.
	 * @param {HandlebarsRenderOptions} options - Options which configure application rendering behavior.
	 * @returns {ApplicationRenderContext}
	 * @protected
	 */
	async _prepareDetailsContext(context, options) {
		const applicableProperties = CONFIG.EverydayHeroes.applicableProperties[
			this.item.system.metadata?.type ?? this.item.type
		];
		if ( applicableProperties && ("properties" in context.source) ) {
			const prop = context.source.properties;
			const isModification = foundry.utils.getType(prop) === "Object";
			context.itemProperties = Object.entries(CONFIG.EverydayHeroes.equipmentProperties)
				.reduce((obj, [k, v]) => {
					if ( applicableProperties.includes(k) ) obj[k] = {
						...v,
						control: isModification ? "property-modification" : "property",
						value: isModification ? prop[k] : (prop.has?.(k) ?? prop.includes?.(k))
					};
					return obj;
				}, {});
		}

		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare rendering context for the effects tab.
	 * @param {ApplicationRenderContext} context - Context being prepared.
	 * @param {HandlebarsRenderOptions} options - Options which configure application rendering behavior.
	 * @returns {ApplicationRenderContext}
	 * @protected
	 */
	async _prepareEffectsContext(context, options) {
		context.effects = ActiveEffectEH.prepareActiveEffectSections(context.item.effects);
		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare rendering context for the header.
	 * @param {ApplicationRenderContext} context - Context being prepared.
	 * @param {HandlebarsRenderOptions} options - Options which configure application rendering behavior.
	 * @returns {ApplicationRenderContext}
	 * @protected
	 */
	async _prepareHeaderContext(context, options) {
		context.showTabs = !foundry.utils.isEmpty(context.tabs);
		const editableType = ("types" in this.item.system) && !BaseItemSheetV2.hasDetailsTab(this.item);
		context.headerFields = [
			{ field: context.fields.name, value: this.item.name },
			editableType
				? this._createFormField(context, "type.value", { options: createFormOptions(this.item.system.types) })
				: {
					field: new foundry.data.fields.StringField(),
					label: _loc("EH.Item.Type.Label"),
					readonly: true,
					value: this.item.system.type?.label ?? this.item.typeLabel
				}
		];

		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Life-Cycle Handlers                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @inheritDoc */
	_attachFrameListeners() {
		super._attachFrameListeners();
		new foundry.applications.ux.ContextMenu.implementation(this.element, "[data-advancement-id]", [], {
			fixed: true,
			onOpen: target => Advancement.onContextMenu(this.item, target),
			jQuery: false
		});
		new foundry.applications.ux.ContextMenu.implementation(this.element, "[data-effect-id]", [], {
			fixed: true,
			onOpen: target => ActiveEffectEH.onContextMenu(this.item, target),
			jQuery: false
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @inheritDoc */
	async _onRender(context, options) {
		await super._onRender(context, options);

		new CONFIG.ux.DragDrop({
			dragSelector: ":is([data-advancement-id], [data-effect-id])",
			dropSelector: null,
			callbacks: {
				dragstart: this._onDragStart.bind(this),
				drop: this._onDrop.bind(this)
			}
		}).bind(this.element);

		for ( const field of this.element.querySelectorAll('[name="editorSelected"]') ) {
			field.addEventListener("change", event => {
				this.editor.selected = event.target.value;
				this.render();
			});
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Event Listeners and Handlers             */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @override */
	_onAddDocument(event, target) {
		const tab = target.closest("[data-tab]")?.dataset.tab;
		switch ( tab ) {
			case "advancement": return AdvancementSelection.createDialog(this.item);
			case "effects": return ActiveEffectEH._onAddEffect.call(this, event, target);
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle modifying the choices for an advancement level.
	 * @this {BaseItemSheetV2}
	 * @param {Event} event - Triggering click event.
	 * @param {HTMLElement} target - Button that was clicked.
	 */
	static #onModifyAdvancementChoices(event, target) {
		const level = target.closest("[data-level]")?.dataset.level;
		const manager = AdvancementManager.forModifyChoices(this.actor, this.item.id, Number(level));
		if ( manager.steps.length ) this._renderChild(manager);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle toggling configuration mode for advancement.
	 * @this {BaseItemSheetV2}
	 * @param {Event} event - Triggering click event.
	 * @param {HTMLElement} target - Button that was clicked.
	 */
	static #onToggleAdvancementConfiguration(event, target) {
		this.advancementConfigurable = !this.advancementConfigurable;
		this.render();
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Drag & Drop                              */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle beginning drag events on the sheet.
	 * @param {DragEvent} event - The initiating drag start event.
	 * @protected
	 */
	_onDragStart(event) {
		const target = event.currentTarget;
		if ( target.classList.contains("content-link") ) return;

		// Create drag data
		const dragData = this._prepareDraggedData(event, target);
		if ( !dragData ) return;

		// Set data transfer
		event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare the data for a drag event.
	 * @param {DragEvent} event - The triggering DragEvent.
	 * @param {Element} target - The dragged element.
	 * @returns {object|void}
	 */
	_prepareDraggedData(event, target) {
		if ( target.dataset.advancementId ) {
			return this.item.system.advancement.get(event.currentTarget.dataset.advancementId)?.toDragData();
		}

		if ( target.dataset.effectId ) {
			return this.item.effects.get(target.dataset.effectId)?.toDragData();
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle dropping items onto the sheet.
	 * @param {DragEvent} event - The concluding drag event.
	 * @returns {any}
	 * @protected
	 */
	_onDrop(event) {
		const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);

		/**
		 * A hook event that fires when some useful data is dropped onto a Item sSheet.
		 * @function everydayHeroes.dropItemSheetData
		 * @memberof hookEvents
		 * @param {ItemEH} item - The item it was dropped upon.
		 * @param {BaseItemSheetV2} sheet - The sheet where the drop occurred.
		 * @param {object} data - The data that has been dropped onto the sheet.
		 * @returns {boolean} - Explicitly return `false` to prevent normal drop handling.
		 */
		if ( Hooks.call("everydayHeroes.dropItemSheetData", this.item, this, data) === false ) return;
		event.stopPropagation();

		this._handleDroppedData(event, data);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle dropped data.
	 * @param {DragEvent} event - The concluding DragEvent which contains drop data.
	 * @param {object} data - The data transfer extracted from the event.
	 * @returns {Promise|void}
	 */
	_handleDroppedData(event, data) {
		switch ( data.type ) {
			case "ActiveEffect":
				return this._onDropActiveEffect(event, data);
			case "Advancement":
			case "Item":
				return this._onDropAdvancement(event, data);
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle the dropping of ActiveEffect data onto the active effects tab.
	 * @param {DragEvent} event - The concluding DragEvent which contains drop data.
	 * @param {object} data - The data transfer extracted from the event.
	 * @returns {Promise<ActiveEffect|boolean>} - The created ActiveEffect object or false if it couldn't be created.
	 * @protected
	 */
	async _onDropActiveEffect(event, data) {
		const effect = await ActiveEffect.implementation.fromDropData(data);
		if ( !this.item.isOwner || !effect ) return false;
		if ( (this.item.uuid === effect.parent.uuid) || (this.item.uuid === effect.origin) ) return false;
		return ActiveEffect.create({
			...effect.toObject(),
			origin: this.item.uuid
		}, { parent: this.item });
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle the dropping of an advancement or item with advancements onto the advancements tab.
	 * @param {DragEvent} event - The concluding DragEvent which contains drop data.
	 * @param {object} data - The data transfer extracted from the event.
	 */
	async _onDropAdvancement(event, data) {
		let advancements;
		let showDialog = false;
		if ( data.type === "Advancement" ) {
			advancements = [await fromUuid(data.uuid)];
		} else if ( data.type === "Item" ) {
			const item = await Item.implementation.fromDropData(data);
			if ( !item ) return false;
			advancements = Array.from(item.system.advancement);
			showDialog = true;
		} else {
			return false;
		}
		advancements = advancements.filter(a => {
			const config = CONFIG.EverydayHeroes.advancementTypes[a.type];
			return !this.item.system.advancement.get(a.id)
				&& config?.validItemTypes.has(this.item.type)
				&& a.constructor.availableForItem(this.item);
		});

		if ( showDialog ) {
			try {
				advancements = await AdvancementMigrationDialog.createDialog(this.item, advancements);
			} catch(error) {
				return false;
			}
		}

		if ( !advancements.length ) return false;
		if ( this.item.isEmbedded ) {
			const manager = AdvancementManager.forNewAdvancement(this.item.actor, this.item.id, advancements);
			if ( manager.steps.length ) return manager.render(true);
		}

		// If no advancements need to be applied, just add them to the item
		const advancementCollection = this.item.system.advancement.toObject();
		advancementCollection.push(...advancements.map(a => a.toObject()));
		this.item.update({"system.advancement": advancementCollection});
	}

	/* -------------------------------------------- */
	/*  Form Handling                               */
	/* -------------------------------------------- */

	/** @inheritDoc */
	_processFormData(event, form, formData) {
		const submitData = super._processFormData(event, form, formData);

		if ( this.item.system.hasOwnProperty("properties") && submitData.system?.properties
			&& foundry.utils.getType(this.item.system.properties) === "Set" ) {
			submitData.system.properties = objectToSet(submitData.system.properties);
		}

		return submitData;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Helpers                                  */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Create form field configuration for a specific field within system data.
	 * @param {ApplicationRenderContext} context
	 * @param {string} keyPath
	 * @param {object} [options={}]
	 * @returns {object}
	 */
	_createFormField(context, keyPath, options={}) {
		return this.item.system._createFormField(context, keyPath, options);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Determine whether an item has a advancement tab to show.
	 * @param {EHItem} item - The item.
	 * @returns {boolean}
	 */
	static hasAdvancementTab(item) {
		return "advancement" in item.system;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Determine whether an item has a details tab to show.
	 * @param {EHItem} item - The item.
	 * @returns {boolean}
	 */
	static hasDetailsTab(item) {
		if ( "hasDetails" in item.system ) {
			// TODO: Add compatibility warning
			return item.system.hasDetails;
		}
		return item.system.metadata?.sheet?.hasDetails
			?? CONFIG.EverydayHeroes.itemCategories[item.system.metadata?.category]?.sheet?.hasDetails
			?? false;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Determine whether an item has a effects tab to show.
	 * @param {EHItem} item - The item.
	 * @returns {boolean}
	 */
	static hasEffectsTab(item) {
		return item.system.metadata?.sheet?.hasEffects
			?? CONFIG.EverydayHeroes.itemCategories[item.system.metadata?.category]?.sheet?.hasEffects
			?? false;
	}
}
