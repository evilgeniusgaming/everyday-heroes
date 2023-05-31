import CompendiumEH from "./compendium.mjs";

export { CompendiumEH };

/**
 * Replace the apps for any compendiums with a type defined in flags for V11 or later.
 */
export function setupCompendiumApps() {
	for ( const pack of game.packs ) {
		if ( !pack.metadata.flags?.["everyday-heroes"]?.sorting ) continue;
		pack.applicationClass = CompendiumEH;
	}
}

/**
 * Replace the apps for any compendiums with a type defined in flags for V10.
 */
export function setupLegacyCompendiumApps() {
	for ( const pack of game.packs ) {
		if ( !pack.metadata.flags?.["everyday-heroes"]?.sorting ) continue;
		const app = new CompendiumEH(pack);
		pack.apps = [app];
	}
}
