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
		return this.actor?.system.items?.get(this.parent?.id) ?? {};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Should this Document run final data preparation on its own, or wait for another Document to call those methods?
	 * @type {boolean}
	 */
	get shouldPrepareFinalData() {
		return !this.parent?.isEmbedded;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Apply transformations or derivations to the values of the source data object.
	 */
	prepareDerivedData() {
		super.prepareDerivedData();
		if ( this.shouldPrepareFinalData ) this.prepareFinalData();
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Final data preparation steps performed on Items after parent actor has been fully prepared.
	 */
	prepareFinalData() {
		this.constructor._getMethods({ startingWith: "prepareFinal", notEndingWith: "Data" }).forEach(k => this[k]());
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
			item: { ...this }
		};
		rollData.prof ??= this.proficiency;
		return rollData;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Enrichment                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Convert this Document to some HTML display for embedding purposes.
	 * @param {DocumentHTMLEmbedConfig} config - Configuration for embedding behavior.
	 * @param {EnrichmentOptions} [options] - The original enrichment options for cases where the Document embed content
	 *                                        also contains text that must be enriched.
	 * @returns {Promise<HTMLElement|HTMLCollection|null>}
	 */
	async toEmbed(config, options={}) {
		const description = foundry.utils.getProperty(this, "description.value") ?? "";
		const enriched = await foundry.applications.ux.TextEditor.implementation.enrichHTML(description, {
			...options, relativeTo: this.parent
		});
		const section = document.createElement("section");
		section.innerHTML = enriched;
		return section.children;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Socket Event Handlers                    */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async _preCreateVariantConversion(data, options, user) {
		const variant = CONFIG.EverydayHeroes.itemVariants[this.constructor.metadata.variant];
		if ( !variant || !this.parent.isEmbedded ) return;
		const type = variant[this.parent.parent.type] ?? this.constructor.metadata.variant;
		if ( type !== this.parent.type ) this.parent.updateSource({ type, "==system": data.system });
	}
}
