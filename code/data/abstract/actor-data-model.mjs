import SystemDataModel from "./system-data-model.mjs";

/**
 * Specialized version of SystemDataModel with some Actor-specific logic.
 */
export default class ActorDataModel extends SystemDataModel {

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
		const description = foundry.utils.getProperty(this, "biography.value") ?? "";
		const enriched = await foundry.applications.ux.TextEditor.implementation.enrichHTML(description, {
			...options, relativeTo: this.parent
		});
		const section = document.createElement("section");
		section.innerHTML = enriched;
		return section.children;
	}
}
