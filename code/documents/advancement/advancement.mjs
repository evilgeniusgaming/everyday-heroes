import AdvancementConfig from "../../applications/advancement/advancement-config.mjs";
import AdvancementFlow from "../../applications/advancement/advancement-flow.mjs";
import BaseAdvancement from "../../data/advancement/base-advancement.mjs";

/**
 * Error that can be thrown during the advancement update preparation process.
 */
class AdvancementError extends Error {
	constructor(...args) {
		super(...args);
		this.name = "AdvancementError";
	}
}

/**
 * Abstract base class which various advancement types can subclass.
 * @param {object} [data={}] - Raw data stored in the advancement object.
 * @param {object} [options={}] - Options which affect DataModel construction.
 * @abstract
 *
 * @copyright Adapted from the [dnd5e system]{@link https://github.com/foundryvtt/dnd5e}
 */
export default class Advancement extends BaseAdvancement {
	constructor(data, {parent=null, ...options}={}) {
		if ( parent instanceof Item ) parent = parent.system;
		super(data, {parent, ...options});

		/**
		 * A collection of Application instances which should be re-rendered whenever this document is updated.
		 * The keys of this object are the application ids and the values are Application instances. Each
		 * Application in this object will have its render method called by {@link Document#render}.
		 * @type {Object<Application>}
		 */
		Object.defineProperty(this, "apps", {
			value: {},
			writable: false,
			enumerable: false
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_initialize(options) {
		super._initialize(options);
		return this.prepareData();
	}

	static ERROR = AdvancementError;

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Information on how an advancement type is configured.
	 *
	 * @typedef {object} AdvancementMetadata
	 * @property {object} dataModels
	 * @property {DataModel} configuration - Data model used for validating configuration data.
	 * @property {DataModel} value - Data model used for validating value data.
	 * @property {number} order - Number used to determine default sorting order of advancement items.
	 * @property {string} icon - Icon used for this advancement type if no user icon is specified.
	 * @property {string} title - Title to be displayed if no user title is specified.
	 * @property {string} hint - Description of this type shown in the advancement selection dialog.
	 * @property {object} identifier
	 * @property {string} identifier.configurable - Should this identifier be customizable for this advancement type?
	 * @property {string} identifier.hint - Hint that is shown with the identifier.
	 * @property {boolean} multiLevel - Can this advancement affect more than one level? If this is set to true,
	 *                                  the level selection control in the configuration window is hidden and the
	 *                                  advancement should provide its own implementation of `Advancement#levels`
	 *                                  and potentially its own level configuration interface.
	 * @property {object} apps
	 * @property {*} apps.config - Subclass of AdvancementConfig that allows for editing of this advancement type.
	 * @property {*} apps.flow - Subclass of AdvancementFlow that is displayed while fulfilling this advancement.
	 */

	/**
	 * Configuration information for this advancement type.
	 * @type {AdvancementMetadata}
	 */
	static get metadata() {
		return {
			order: 100,
			icon: "icons/svg/upgrade.svg",
			title: game.i18n.localize("EH.Advancement.Core.Title"),
			hint: "",
			identifier: {
				configurable: false,
				hint: ""
			},
			multiLevel: false,
			apps: {
				config: AdvancementConfig,
				flow: AdvancementFlow
			}
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Existing sheets of a specific type for a specific document.
	 * @type {Map<[PseudoDocument, typeof ApplicationV2], ApplicationV2>}
	 */
	static _sheets = new Map();

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Instance Properties                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Actor to which this advancement's item belongs, if the item is embedded.
	 * @type {ActorEH|null}
	 */
	get actor() {
		return this.item.parent ?? null;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Unique identifier for this advancement within its item.
	 * @type {string}
	 */
	get id() {
		return this._id;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Item to which this advancement belongs.
	 * @type {ItemEH}
	 */
	get item() {
		return this.parent.parent;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * List of levels in which this advancement object should be displayed. Will be a list of class levels if this
	 * advancement is being applied to classes or subclasses, otherwise a list of character levels.
	 * @returns {number[]}
	 */
	get levels() {
		return this.level !== undefined ? [this.level] : [];
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Lazily obtain a Application instance used to configure this PseudoDocument, or null if no sheet is available.
	 * @type {Application|ApplicationV2|null}
	 */
	get sheet() {
		const cls = this.constructor.metadata.apps.config;
		if ( !cls ) return null;
		if ( !this.constructor._sheets.has(this.uuid) ) {
			let sheet;
			if ( Application.isPrototypeOf(cls) ) sheet = new cls(this);
			else sheet = new cls({ document: this });
			this.constructor._sheets.set(this.uuid, sheet);
		}
		return this.constructor._sheets.get(this.uuid);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Type of this advancement.
	 * @type {string}
	 */
	get type() {
		return this._type;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Globally unique identifier for this advancement.
	 * @type {string}
	 */
	get uuid() {
		return `${this.item.uuid}.Advancement.${this.id}`;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Preparation Methods                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare data for the Advancement.
	 */
	prepareData() {
		this.title = this.title || this.constructor.metadata.title;
		this.icon = this.icon || this.constructor.metadata.icon;
		this.identifier = this.identifier || this.title.slugify({strict: true});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Display Methods                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Has the player made choices for this advancement at the specified level?
	 * @param {number} level - Level for which to check configuration.
	 * @returns {boolean} - Have any available choices been made?
	 */
	configuredForLevel(level) {
		return true;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Value used for sorting this advancement at a certain level.
	 * @param {number} level - Level for which this entry is being sorted.
	 * @returns {string} - String that can be used for sorting.
	 */
	sortingValueForLevel(level) {
		return `${this.constructor.metadata.order.paddedString(4)} ${this.titleForLevel(level)}`;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Title displayed in advancement list for a specific level.
	 * @param {number} level - Level for which to generate a title.
	 * @param {object} [options={}]
	 * @param {object} [options.configMode=false] - Is the advancement's item sheet in configuration mode? When in
	 *                                              config mode, the choices already made on this actor should not
	 *                                              be displayed.
	 * @returns {string} - HTML title with any level-specific information.
	 */
	titleForLevel(level, { configMode=false }={}) {
		return this.title;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Summary content displayed beneath the title in the advancement list.
	 * @param {number} level - Level for which to generate the summary.
	 * @param {object} [options={}]
	 * @param {object} [options.configMode=false] - Is the advancement's item sheet in configuration mode? When in
	 *                                              config mode, the choices already made on this actor should not
	 *                                              be displayed.
	 * @returns {string} - HTML content of the summary.
	 */
	summaryForLevel(level, { configMode=false }={}) {
		return "";
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Render all of the Application instances which are connected to this advancement.
	 * @param {boolean} [force=false] - Force rendering
	 * @param {object} [context={}] - Optional context
	 */
	render(force=false, context={}) {
		for ( const app of Object.values(this.apps) ) app.render(force, context);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Editing Methods                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Delete this Advancement, removing it from the database.
	 * @param {object} [options={}] - Additional context which customizes the deletion workflow.
	 * @returns {Promise<Advancement>} - The deleted Advancement instance.
	 */
	async delete(options={}) {
		if ( this.item.isEmbedded ) {
			const manager = EverydayHeroes.applications.advancement.AdvancementManager
				.forDeletedAdvancement(this.item.actor, this.item.id, this.id);
			if ( manager.steps.length ) return manager.render({ force: true });
		}
		return await this.item.deleteAdvancement(this.id, options);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Present a Dialog form to confirm deletion of this Advancement.
	 * @param {object} [options] - Positioning and sizing options for the resulting dialog.
	 * @returns {Promise<Advancement>} - A Promise which resolves to the deleted Advancement.
	 */
	async deleteDialog({ sheet, ...options }={}) {
		const type = game.i18n.localize("EH.Advancement.Title[one]");
		const config = foundry.utils.mergeObject({
			window: { title: `${game.i18n.format("DOCUMENT.Delete", { type })}: ${this.title}` },
			content: `
				<p>
					<strong>${game.i18n.localize("COMMON.AreYouSure")}</strong> ${
						game.i18n.format("SIDEBAR.DeleteWarning", { type })}
				</p>
			`,
			yes: { callback: this.delete.bind(this) }
		}, options);
		if ( sheet ) return sheet._confirmDialog(config);
		return foundry.applications.api.DialogV2.confirm(config);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Update this advancement.
	 * @param {object} updates - Updates to apply to this advancement.
	 * @returns {Promise<Advancement>} - This advancement after updates have been applied.
	 */
	async update(updates) {
		await this.item.updateAdvancement(this.id, updates);
		return this;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Update this advancement's data on the item without performing a database commit.
	 * @param {object} updates - Updates to apply to this advancement.
	 * @returns {Advancement} - This advancement after updates have been applied.
	 */
	updateSource(updates) {
		super.updateSource(updates);
		return this;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Can an advancement of this type be added to the provided item?
	 * @param {ItemEH} item - Item to check against.
	 * @returns {boolean} - Should this be enabled as an option on the {@link AdvancementSelection} dialog?
	 */
	static availableForItem(item) {
		return true;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Serialize salient information for this Advancement when dragging it.
	 * @returns {object} - An object of drag data.
	 */
	toDragData() {
		const dragData = { type: "Advancement" };
		if ( this.id ) dragData.uuid = this.uuid;
		else dragData.data = this.toObject();
		return dragData;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Application Methods                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Locally apply this advancement to the actor.
	 * @param {number} level - Level being advanced.
	 * @param {object} data - Data from the advancement form.
	 * @abstract
	 */
	async apply(level, data) { }

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Locally apply this advancement from stored data, if possible. If stored data can not be restored for any reason,
	 * throw an AdvancementError to display the advancement flow UI.
	 * @param {number} level - Level being advanced.
	 * @param {object} data - Data from {@link Advancement#reverse} needed to restore this advancement.
	 * @abstract
	 */
	async restore(level, data) { }

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Locally remove this advancement's changes from the actor.
	 * @param {number} level - Level being removed.
	 * @returns {object} - Data that can be passed to the {@link Advancement#restore} method to restore this reversal.
	 * @abstract
	 */
	async reverse(level) { }

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Fetch an item and create a clone with the proper flags.
	 * @param {string} uuid - UUID of the item to fetch.
	 * @param {object} [options={}]
	 * @param {object} [options.changes={}] - Additional changes to apply when creating the clone.
	 * @param {string} [options.id] - Optional ID to use instead of the random one.
	 */
	async createItemData(uuid, { changes={}, id }={}) {
		const source = await fromUuid(uuid);
		if ( !source ) return null;
		id ??= foundry.utils.randomID();
		return source.clone(
			foundry.utils.mergeObject(
				{
					_id: id,
					folder: null,
					sort: null,
					"flags.everyday-heroes.sourceId": uuid,
					"flags.everyday-heroes.advancementOrigin": `${this.item.id}.${this.id}`
				},
				changes
			), {keepId: true}
		).toObject();
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Event Listeners & Handlers               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Construct context menu options for this Advancement.
	 * @returns {ContextMenuEntry[]}
	 */
	getContextMenuOptions() {
		if ( this.item.isOwner && !this.item.collection?.locked ) return [
			{
				label: "EH.Advancement.Core.Action.Edit",
				icon: "<i class='fas fa-edit fa-fw'></i>",
				onClick: () => this.item.sheet._renderChild(this.sheet)
			},
			{
				label: "EH.Advancement.Core.Action.Duplicate",
				icon: "<i class='fas fa-copy fa-fw'></i>",
				visible: () => this?.constructor.availableForItem(this.item),
				onClick: () => this.item.duplicateAdvancement(this.id)
			},
			{
				label: "EH.Advancement.Core.Action.Delete",
				icon: "<i class='fas fa-trash fa-fw' style='color: rgb(255, 65, 65);'></i>",
				onClick: () => this.deleteDialog()
			}
		];

		return [{
			label: "EH.Advancement.Core.Action.View",
			icon: "<i class='fas fa-eye fa-fw'></i>",
			onClick: () => this.item.sheet._renderChild(this.sheet)
		}];
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle context menu events on advancement.
	 * @param {Item5e} item - The Item the Advancement belongs to.
	 * @param {HTMLElement} target - The element the menu was triggered on.
	 */
	static onContextMenu(item, target) {
		const { advancementId } = target.closest("[data-advancement-id]")?.dataset ?? {};
		const advancement = item.system.advancement?.get(advancementId);
		if ( !advancement ) return;

		const menuItems = advancement.getContextMenuOptions();

		/**
		 * A hook event that fires when the context menu for the advancements list is constructed.
		 * @function everydayHeroes.getItemAdvancementContext
		 * @memberof hookEvents
		 * @param {Advancement} advancement - The Advancement.
		 * @param {HTMLElement} target - The element that menu was triggered on.
		 * @param {ContextMenuEntry[]} menuItems - The context menu entries.
		 */
		Hooks.call("everydayHeroes.getItemAdvancementContext", advancement, target, menuItems);

		ui.context.menuItems = menuItems;
	}
}
