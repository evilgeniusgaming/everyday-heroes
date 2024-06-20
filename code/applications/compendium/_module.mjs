import TableOfContentsCompendium from "./table-of-contents.mjs";

export {
	TableOfContentsCompendium
};

/**
 * Replace the apps for any compendiums with a type defined in flags for V11 or later.
 */
export function setupCompendiumApps() {
	for ( const pack of game.packs ) {
		const sorting = pack.metadata.flags?.["everyday-heroes"]?.sorting;
		if ( sorting === "table-of-contents" ) pack.applicationClass = TableOfContentsCompendium;
	}
}

/**
 * Replace the apps for any compendiums with a type defined in flags for V10.
 */
export function setupLegacyCompendiumApps() {
	for ( const pack of game.packs ) {
		const sorting = pack.metadata.flags?.["everyday-heroes"]?.sorting;
		if ( sorting !== "table-of-contents" ) continue;
		const app = new TableOfContentsCompendium(pack);
		pack.apps = [app];
	}
}
