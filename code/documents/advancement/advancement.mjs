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
	 * @property {Set<string>} validItemTypes - Set of types to which this advancement can be added.
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
			validItemTypes: new Set(["archetype", "class", "background", "profession", "feat"]),
			apps: {
				config: AdvancementConfig,
				flow: AdvancementFlow
			}
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Instance Properties                      */
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

	/**
	 * Item to which this advancement belongs.
	 * @type {ItemEH}
	 */
	get item() {
		return this.parent.parent;
	}

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
	 * List of levels in which this advancement object should be displayed. Will be a list of class levels if this
	 * advancement is being applied to classes or subclasses, otherwise a list of character levels.
	 * @returns {number[]}
	 */
	get levels() {
		return this.level !== undefined ? [this.level] : [];
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

}
