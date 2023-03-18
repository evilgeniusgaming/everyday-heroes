import AdvancementManager from "../advancement/advancement-manager.mjs";
import AdvancementSelection from "../advancement/advancement-selection.mjs";

/**
 * Sheet that represents Archetype, Class, Background, and Profession items.
 */
export default class ConceptSheet extends ItemSheet {

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["everyday-heroes", "sheet", "concept", "item"],
			template: "systems/everyday-heroes/templates/item/concept-sheet.hbs",
			tabs: [{navSelector: 'nav[data-group="primary"]', contentSelector: "main", initial: "description"}],
			width: 570,
			height: 500
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Whether advancements on embedded items should be configurable.
	 * @type {boolean}
	 */
	advancementConfigurable = false;

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Context Preparation                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async getData(options) {
		const context = await super.getData(options);

		context.CONFIG = CONFIG.EverydayHeroes;
		context.system = context.item.system;
		context.source = context.item.system.toObject();

		context.advancementEditable = (this.advancementConfigurable || !context.item.isEmbedded) && context.editable;
		context.advancement = this.prepareAdvancement();

		const enrichmentContext = {
			secrets: this.item.isOwner, rollData: this.item.getRollData(), async: true, relativeTo: this.item
		};
		context.enriched = {
			description: await TextEditor.enrichHTML(context.system.description.value, enrichmentContext),
			chat: await TextEditor.enrichHTML(context.system.description.chat, enrichmentContext)
		};

		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare advancement items for display on the sheet.
	 * @returns {object[]}
	 */
	prepareAdvancement() {
		const advancement = {};
		const configMode = !this.item.parent || this.advancementConfigurable;
		const maxLevel = this.item.parent?.system.details.level ?? -1;

		// Improperly configured advancements
		const needingConfiguration = this.item.system.advancement.filter(a => !a.levels.length);
		if ( needingConfiguration.length ) {
			advancement.unconfigured = {
				items: needingConfiguration.map(a => ({
					id: a.id,
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
				order: a.sortingValueForLevel(level),
				title: a.titleForLevel(level, {configMode}),
				icon: a.icon,
				summary: a.summaryForLevel(level, {configMode}),
				configured: a.configuredForLevel(level)
			}));
			if ( !items.length ) continue;
			advancement[level] = {
				items: items.sort((a, b) => a.order.localeCompare(b.order)),
				configured: (level > maxLevel) ? false : items.some(a => !a.configured) ? "partial" : "full"
			};
		}

		return advancement;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Action Handlers                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	activateListeners(jQuery) {
		super.activateListeners(jQuery);
		const html = jQuery[0];
		if ( this.isEditable ) {
			for ( const a of html.querySelectorAll('[data-tab="advancement"] fieldset a') ) a.addEventListener("click", event => {
				const target = event.currentTarget;
				if ( target.dataset.action ) this._onAdvancementAction(target, target.dataset.action);
			});
		}

		const contextOptions = this._getAdvancementContextMenuOptions();
		/**
		 * A hook event that fires when the context menu for the advancements list is constructed.
		 * @function everydayHeroes.getItemAdvancementContext
		 * @memberof hookEvents
		 * @param {jQuery} html - The HTML element to which the context options are attached.
		 * @param {ContextMenuEntry[]} entryOptions - The context menu entries.
		 */
		Hooks.call("everydayHeroes.getItemAdvancementContext", jQuery, contextOptions);
		if ( contextOptions ) new ContextMenu(jQuery, "[data-advancement-id]", contextOptions);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Get the set of ContextMenu options which should be applied for advancement entries.
	 * @returns {ContextMenuEntry[]} - Context menu entries.
	 * @protected
	 */
	_getAdvancementContextMenuOptions() {
		const condition = li => (this.advancementConfigurable || !this.isEmbedded) && this.isEditable;
		return [
			{
				name: "EH.Advancement.Core.Action.Edit",
				icon: "<i class='fas fa-edit fa-fw'></i>",
				condition,
				callback: li => this._onAdvancementAction(li[0], "edit")
			},
			{
				name: "EH.Advancement.Core.Action.Duplicate",
				icon: "<i class='fas fa-copy fa-fw'></i>",
				condition: li => {
					const id = li[0].closest("[data-advancement-id]")?.dataset.advancementId;
					const advancement = this.item.system.advancement.get(id);
					return condition(li) && advancement?.constructor.availableForItem(this.item);
				},
				callback: li => this._onAdvancementAction(li[0], "duplicate")
			},
			{
				name: "EH.Advancement.Core.Action.Delete",
				icon: "<i class='fas fa-trash fa-fw' style='color: rgb(255, 65, 65);'></i>",
				condition,
				callback: li => this._onAdvancementAction(li[0], "delete")
			}
		];
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle one of the advancement actions from the buttons or context menu.
	 * @param {Element} target - Button or context menu entry that triggered this action.
	 * @param {string} action - Action being triggered.
	 * @returns {Promise|void}
	 */
	_onAdvancementAction(target, action) {
		const id = target.closest("[data-advancement-id]")?.dataset.advancementId;
		const advancement = this.item.system.advancement.get(id);
		if ( ["edit", "delete", "duplicate"].includes(action) && !advancement ) return;
		switch (action) {
			case "add": return AdvancementSelection.createDialog(this.item);
			case "edit": return new advancement.constructor.metadata.apps.config(advancement).render(true);
			case "delete":
				if ( this.item.isEmbedded ) {
					manager = AdvancementManager.forDeletedAdvancement(this.item.actor, this.item.id, id);
					if ( manager.steps.length ) return manager.render(true);
				}
				return this.item.deleteAdvancement(id);
			case "duplicate": return this.item.duplicateAdvancement(id);
			case "modify-choices": return console.log("MODIFY CHOICES");
			case "toggle-configuration":
				this.advancementConfigurable = !this.advancementConfigurable;
				return this.render();
			default:
				return console.warn(`Everyday Heroes | Invalid advancement action type clicked ${action}.`);
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Drag & Drop                              */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_onDragStart(event) {
		const li = event.currentTarget;
		if ( event.target.classList.contains("content-link") ) return;

		// Create drag data
		let dragData;

		// Active Effect
		if ( li.dataset.advancementId ) {
			dragData = this.item.system.advancement.get(li.dataset.advancementId)?.toDragData();
		}

		if ( !dragData ) return;

		// Set data transfer
		event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_onDrop(event) {
		const data = TextEditor.getDragEventData(event);
		const item = this.item;

		/**
		 * A hook event that fires when some useful data is dropped onto a ConceptSheet.
		 * @function everydayHeroes.dropItemSheetData
		 * @memberof hookEvents
		 * @param {ItemEH} item - The item it was dropped upon.
		 * @param {ConceptSheet} sheet - The sheet where the drop occurred.
		 * @param {object} data - The data that has been dropped onto the sheet.
		 * @returns {boolean} - Explicitly return `false` to prevent normal drop handling.
		 */
		if ( Hooks.call("everydayHeroes.dropItemSheetData", item, this, data) === false ) return;

		switch ( data.type ) {
			case "Advancement":
			case "Item":
				return this._onDropAdvancement(event, data);
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle the dropping of an advancement or item with advancements onto the advancements tab.
	 * @param {DragEvent} event - The concluding DragEvent which contains drop data.
	 * @param {object} data - The data transfer extracted from the event.
	 */
	_onDropAdvancement(event, data) {
		console.log("_onDropAdvancement");
	}
}
