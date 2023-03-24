import CompendiumEH from "./compendium.mjs";

export { CompendiumEH };

/**
 * Replace the apps for any compendiums with a type defined in flags.
 */
export function setupCompendiumApps() {
	for ( const pack of game.packs ) {
		if ( !pack.metadata.flags?.type ) continue;
		const app = new CompendiumEH(pack);
		pack.apps = [app];
	}
}
