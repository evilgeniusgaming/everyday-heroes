import * as actor from "./actor/_module.mjs";
import * as item from "./item/_module.mjs";

/**
 * Register the various system data models provided by Everyday Heroes during initialization.
 */
export function registerSystemDataModels() {
	CONFIG.Actor.systemDataModels = actor.config;
	CONFIG.Item.systemDataModels = item.config;
}

export {actor, item};
export * as fields from "./fields/_module.mjs";
