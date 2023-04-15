/**
 * Register the provided data models with Foundry using data from their metadata.
 * @param {string} documentType - Document type to which these models will be registered.
 * @param {Object<string, SystemDataModel>} models - Models to register grouped by type name.
 */
export function registerDataModels(documentType, models) {
	const config = CONFIG[documentType];
	config.typeLabelsPlural ??= {};
	for ( const [type, model] of Object.entries(models) ) {
		config[game.release.generation > 10 ? "dataModels" : "systemDataModels"][type] = model;
		config.typeLabels[type] = `${model.metadata.localization}[one]`;
		config.typeLabelsPlural[type] = `${model.metadata.localization}[other]`;
		if ( model.metadata.icon ) config.typeIcons[type] = model.metadata.icon;
	}
}
