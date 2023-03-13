import AdvancementConfig from "./advancement-config.mjs";

/**
 * Configuration application for item grants.
 */
export default class ItemGrantConfig extends AdvancementConfig {

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["everyday-heroes", "advancement", "config", "item-grant"],
			dragDrop: [{ dropSelector: ".drop-target" }],
			dropKeyPath: "pool",
			template: "systems/everyday-heroes/templates/advancement/item-grant-config.hbs"
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_validateDroppedItem(event, item) {
		this.advancement._validateItemType(item);
	}
}
