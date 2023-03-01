/**
 * Base class for the advancement interface displayed by the advancement prompt that should be subclassed by
 * individual advancement types.
 *
 * @param {ItemEH} item - Item to which the advancement belongs.
 * @param {string} advancementId - ID of the advancement this flow modifies.
 * @param {number} level - Level for which to configure this flow.
 * @param {object} [options={}] - Application rendering options.
 *
 * @copyright Adapted from the [dnd5e system]{@link https://github.com/foundryvtt/dnd5e}
 */
export default class AdvancementFlow extends FormApplication {
	constructor(item, advancementId, level, options={}) {
		super({}, options);
		this.#advancementId = advancementId;
		this.item = item;
		this.level = level;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * ID of the advancement this flow modifies.
	 * @type {string}
	 * @private
	 */
	#advancementId;

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * The item that houses the Advancement.
	 * @type {ItemEH}
	 */
	item;

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Level for which to configure this flow.
	 * @type {number}
	 */
	level;

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Data retained by the advancement manager during a reverse step. If restoring data using
	 * {@link Advancement#restore}, this data should be used when displaying the flow's form.
	 * @type {object|null}
	 */
	retainedData = null;

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			template: "systems/everyday-heroes/templates/advancement/advancement-flow.hbs",
			popOut: false
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get id() {
		return `actor-${this.advancement.item.id}-advancement-${this.advancement.id}-${this.level}`;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get title() {
		return this.advancement.title;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * The Advancement object this flow modifies.
	 * @type {Advancement|null}
	 */
	get advancement() {
		return this.item.system.advancement?.get(this.#advancementId) ?? null;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Set the retained data for this flow. This method gives the flow a change to do any additional prep
	 * work required for the retained data before the application is rendered.
	 * @param {object} data - Retained data associated with this flow.
	 */
	async attachRetainedData(data) {
		this.retainedData = data;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	getData() {
		return {
			appId: this.id,
			advancement: this.advancement,
			type: this.advancement.constructor.typeName,
			title: this.title,
			summary: this.advancement.summaryForLevel(this.level),
			level: this.level
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async _updateObject(event, formData) {
		await this.advancement.apply(this.level, formData);
	}
}
