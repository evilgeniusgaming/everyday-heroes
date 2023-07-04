import { insertBetween } from "../utils.mjs";
export * as actor from "./actor/_module.mjs";
export * as abstract from "./abstract/_module.mjs";
export * as advancement from "./advancement/_module.mjs";
export * as fields from "./fields/_module.mjs";
export * as item from "./item/_module.mjs";
export {default as DamageData} from "./shared/damage-data.mjs";
export {default as DamageModificationData} from "./shared/damage-modification-data.mjs";
export {default as PrimaryDamageData} from "./shared/primary-damage-data.mjs";
export {default as SupplementalDamageData} from "./shared/supplemental-damage-data.mjs";

/**
 * Register the provided data models with Foundry using data from their metadata.
 * @param {string} documentType - Document type to which these models will be registered.
 * @param {Object<string, SystemDataModel>} models - Models to register grouped by type name.
 * @param {string} [module] - ID of the module registering the types, if applicable.
 */
export function registerDataModels(documentType, models, module) {
	const config = CONFIG[documentType];
	config.categories = CONFIG.EverydayHeroes[
		`${documentType.charAt(0).toLowerCase()}${documentType.slice(1)}Categories`
	];
	config.typeLabelsPlural ??= {};
	for ( let [type, model] of Object.entries(models) ) {
		if ( model.metadata.module ) type = `${model.metadata.module}.${type}`;
		config[game.release.generation > 10 ? "dataModels" : "systemDataModels"][type] = model;
		config.typeLabels[type] = `${model.metadata.localization}[one]`;
		config.typeLabelsPlural[type] = `${model.metadata.localization}[other]`;
		if ( model.metadata.icon ) config.typeIcons[type] = model.metadata.icon;
		if ( config.categories?.[model.metadata.category] ) {
			const types = config.categories[model.metadata.category].types;
			if ( !types.includes(type) ) insertBetween(types, type, model.metadata.categoryPosition);
		}
	}
}
