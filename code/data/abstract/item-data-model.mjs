import SystemDataModel from "./system-data-model.mjs";

/**
 * Specialized version of SystemDataModel with some Item-specific logic.
 */
export default class ItemDataModel extends SystemDataModel {

	/**
	 * Metadata that describes an item data type.
	 *
	 * @typedef {SystemDataMetadata} ItemDataMetadata
	 * @property {string} [sheetLocalization] - Alternate localization key used when displaying an item on an actor sheet.
	 * @property {boolean} [register] - Register all items of this type within the central list. Only used on Items.
	 * @property {string} [variant] - Key used to register this item in the automatic item variant system. Should match
	 *                                a key in the `CONFIG.EverydayHeroes.itemVariants` configuration object.
	 */

	/**
	 * Metadata that describes a type.
	 * @type {ItemDataMetadata}
	 */
	static metadata = {};

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Actor who is acting using this item. Usually the actor within who this item is embedded.
	 * @type {ActorEH|null}
	 */
	get actor() {
		return this.parent?.parent instanceof Actor ? this.parent.parent : null;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Any actor-specific context such as whether this weapon is equipped.
	 * @type {object}
	 */
	get actorContext() {
		return this.parent?.parent?.system.items[this.parent?.id] ?? {};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Helpers                                  */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Type-specific roll data preparation.
	 * @param {object} [options={}]
	 * @param {ActorEH} [options.actor] - Actor to use when compiling roll data.
	 * @returns {object}
	 */
	getRollData({ actor, ...options }={}) {
		actor ??= this.actor;
		const rollData = {
			...(actor?.getRollData(options) ?? {}),
			item: this.toObject(false)
		};
		rollData.prof ??= this.proficiency;
		return rollData;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Socket Event Handlers                    */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async _preCreate(data, options, user) {
		await super._preCreate(data, options, user);
		const variant = CONFIG.EverydayHeroes.itemVariants[this.constructor.metadata.variant];
		if ( !variant || !this.parent.isEmbedded ) return;
		const type = variant[this.parent.parent.type] ?? this.constructor.metadata.variant;
		if ( type !== this.parent.type ) this.parent.updateSource({ type });
	}
}
