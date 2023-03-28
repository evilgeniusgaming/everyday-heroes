import AdvancementManager from "../advancement/advancement-manager.mjs";
import AdvancementMigrationDialog from "../advancement/advancement-migration-dialog.mjs";
import AdvancementSelection from "../advancement/advancement-selection.mjs";
import BaseItemSheet from "./base-item-sheet.mjs";

/**
 * Sheet that provides advancement features to item sheets.
 */
export default class AdvancementItemSheet extends BaseItemSheet {

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

		context.advancementEditable = (this.advancementConfigurable || !context.item.isEmbedded) && context.editable;
		if ( this.item.system.advancement ) context.advancement = this.prepareAdvancement();

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
		let manager;
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
			case "modify-choices":
				const level = target.closest("[data-level]")?.dataset.level;
				manager = AdvancementManager.forModifyChoices(this.item.actor, this.item.id, Number(level));
				if ( level && manager.steps.length ) manager.render(true);
				return;
			case "toggle-configuration":
				this.advancementConfigurable = !this.advancementConfigurable;
				return this.render();
			default:
				return console.warn(`Everyday Heroes | Invalid advancement action type clicked ${action}.`);
		}
	}
}
