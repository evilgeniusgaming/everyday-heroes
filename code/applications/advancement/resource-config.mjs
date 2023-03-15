import ScaleValueConfig from "./scale-value-config.mjs";

/**
 * Configuration application for resource values.
 */
export default class ResourceConfig extends ScaleValueConfig {
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["everyday-heroes", "advancement", "config", "scale-value", "resource", "two-column"],
			template: "systems/everyday-heroes/templates/advancement/resource-config.hbs"
		});
	}
}
