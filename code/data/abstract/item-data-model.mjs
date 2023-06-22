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
	/*  Socket Event Handlers                    */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async _preCreate(data, options, user) {
		await super._preCreate(data, options, user);
		const variant = CONFIG.EverydayHeroes.itemVariants[this.constructor.metadata.variant];
		if ( !variant || !this.parent.isEmbedded ) return;
		const type = variant[this.parent.actor.type] ?? this.constructor.metadata.variant;
		if ( type !== this.parent.type ) this.parent.updateSource({ type });
	}
}
