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
export * as abstract from "./abstract/_module.mjs";
export * as advancement from "./advancement/_module.mjs";
export * as fields from "./fields/_module.mjs";
export {default as DamageData} from "./shared/damage-data.mjs";
export {default as DamageModificationData} from "./shared/damage-modification-data.mjs";
