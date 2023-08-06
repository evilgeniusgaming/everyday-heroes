import { sortObjectEntries, systemLog } from "../utils.mjs";

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Localization                             */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Storage for pre-localization configuration.
 * @type {object}
 * @private
 */
const _preLocalizationRegistrations = {};

/**
 * Mark the provided config key to be pre-localized during the init stage.
 * @param {string} configKeyPath  - Key path within the configuration object.
 * @param {object} [options={}]
 * @param {string} [options.key] - If each entry in the config enum is an object, localize and sort using this property.
 * @param {string[]} [options.keys=[]] - Array of localization keys. First key listed will be used for sorting
 *                                       if multiple are provided.
 * @param {boolean} [options.sort=false] - Sort this config enum, using the key if set.
 * @param {object} [options.registrations] - Location where the registration information will be stored. If not
 *                                           set then the global registration store will be used.
 */
export function preLocalize(configKeyPath, { key, keys=[], sort=false, registrations }={}) {
	if ( key ) keys.unshift(key);
	registrations ??= _preLocalizationRegistrations;
	registrations[configKeyPath] = { keys, sort };
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Execute previously defined pre-localization tasks on the provided config object.
 * @param {object} config - The config object to localize and sort. *Will be mutated.*
 * @param {object} [registrations] - Object of localization registrations. If not set then the global registration
 *                                   store will be used.
 */
export function performPreLocalization(config, registrations) {
	systemLog("Localizing configuration");
	registrations ??= _preLocalizationRegistrations;
	for ( const [keyPath, settings] of Object.entries(registrations) ) {
		const target = foundry.utils.getProperty(config, keyPath);
		localizeObject(target, settings.keys);
		if ( settings.sort ) foundry.utils.setProperty(config, keyPath, sortObjectEntries(target, settings.keys[0]));
	}
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Localize the values of a configuration object by translating them in-place.
 * @param {object} obj - The configuration object to localize.
 * @param {string[]} [keys] - List of inner keys that should be localized if this is an object.
 */
export function localizeObject(obj, keys) {
	for ( const [k, v] of Object.entries(obj) ) {
		const type = typeof v;
		if ( type === "string" ) {
			obj[k] = game.i18n.localize(v);
			continue;
		}

		if ( type !== "object" ) {
			console.error(new Error(
				`Pre-localized configuration values must be a string or object, ${type} found for "${k}" instead.`
			));
			continue;
		}
		if ( !keys?.length ) {
			console.error(new Error(
				"Localization keys must be provided for pre-localizing when target is an object."
			));
			continue;
		}

		for ( const key of keys ) {
			if ( !v[key] ) continue;
			v[key] = game.i18n.localize(v[key]);
		}
	}
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Status Effects                           */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Replace core status effects with system-specific ones.
 */
export function configureStatusEffects() {
	systemLog("Configuring status effects");
	CONFIG.statusEffects = CONFIG.statusEffects.filter(e => CONFIG.EverydayHeroes.retainedStatusEffects.includes(e.id));
	for ( const [id, {label: name, icon, coreEffect}] of Object.entries(CONFIG.EverydayHeroes.conditions) ) {
		CONFIG.statusEffects.push({ id, name, icon });
		if ( coreEffect ) CONFIG.specialStatusEffects[coreEffect] = id;
	}
	console.log(CONFIG.statusEffects, CONFIG.specialStatusEffects);
}
