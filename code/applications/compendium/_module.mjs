import CompendiumEH from "./compendium.mjs";
import TableOfContentsCompendium from "./table-of-contents.mjs";

export {
	CompendiumEH,
	TableOfContentsCompendium
};

/**
 * Replace the apps for any compendiums with a type defined in flags for V11 or later.
 */
export function setupCompendiumApps() {
	for ( const pack of game.packs ) {
		const sorting = pack.metadata.flags?.["everyday-heroes"]?.sorting;
		if ( !sorting ) continue;
		pack.applicationClass = sorting === "table-of-contents" ? TableOfContentsCompendium : CompendiumEH;
	}
}

/**
 * Replace the apps for any compendiums with a type defined in flags for V10.
 */
export function setupLegacyCompendiumApps() {
	for ( const pack of game.packs ) {
		const sorting = pack.metadata.flags?.["everyday-heroes"]?.sorting;
		if ( !sorting ) continue;
		const Cls = sorting === "table-of-contents" ? TableOfContentsCompendium : CompendiumEH;
		const app = new Cls(pack);
		pack.apps = [app];
	}
}
