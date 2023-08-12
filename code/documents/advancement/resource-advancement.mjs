import ResourceConfig from "../../applications/advancement/resource-config.mjs";
import { ResourceConfigurationData } from "../../data/advancement/resource-data.mjs";
import ScaleValueAdvancement from "./scale-value-advancement.mjs";

/**
 * Advancement that gives the character a resource to spend.
 */
export default class ResourceAdvancement extends ScaleValueAdvancement {
	static get metadata() {
		return foundry.utils.mergeObject(super.metadata, {
			dataModels: {
				configuration: ResourceConfigurationData
			},
			title: game.i18n.localize("EH.Advancement.Resource.Title"),
			hint: game.i18n.localize("EH.Advancement.Resource.Hint"),
			apps: {
				config: ResourceConfig
			}
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * The available types of scaling value.
	 * @enum {ScaleValueType}
	 */
	static TYPES = Object.fromEntries(Object.entries(super.TYPES).filter(([k, v]) => v.metadata.validResource));
}
