import { slugify } from "../utils.mjs";

/**
 * @typedef {object} ItemRegistration
 * @property {string} name - Item's name.
 * @property {string} img - Item's icon.
 * @property {string[]} source - UUIDs of where this item is defined.
 */

/**
 * Registered item information grouped by type and identifier.
 * @type {Object<string, Object<string, ItemRegistration>>}
 * @private
 */
export const all = {};

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Lookup                                   */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Fetch the item registration for the provided identifier if it exists.
 * @param {string} type - Item type to get.
 * @param {string} identifier - Identifier to get.
 * @returns {ItemRegistration|undefined}
 */
export async function get(type, identifier) {
	return (await all[type])?.[identifier];
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Fetch all registered items of the specified type.
 * @param {string} type - Item type to get.
 * @returns {Object<string, ItemRegistration>|undefined}
 */
export async function list(type) {
	return await all[type];
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Registration                             */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Register all item types with `register` to to `true` in their metadata.
 * @private
 */
export function registerItemTypes() {
	const indexes = _indexCompendiums();
	console.log("Everyday Heroes | Preparing central item registrations");
	for ( const type of Item.TYPES ) {
		const dataModel = CONFIG.Item[game.release.generation > 10 ? "dataModels" : "systemDataModels"][type];
		if ( !dataModel?.metadata?.register ) continue;
		all[type] = _registerItemType(type, indexes);
	}
	console.groupEnd();
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Register all items of the specified type within compendiums or the world. Should only be called once per item type.
 * @param {string} type - Item type to register.
 * @param {Map[]} [indexes] - Previously prepared indexes of all Item compendiums.
 * @private
 */
async function _registerItemType(type, indexes) {
	indexes = await (indexes ?? _indexCompendiums());
	const registerItem = (item, uuidPrefix) => {
		const identifier = item.system?.identifier?.value ?? slugify(item.name, { strict: true });
		registrations[identifier] ??= { sources: [] };
		registrations[identifier].name = item.name;
		registrations[identifier].img = item.img;
		registrations[identifier].sources.push(`${uuidPrefix}.${item._id}`);
	};

	console.groupCollapsed(`Everyday Heroes | Registering ${type} items`);
	const registrations = {};
	for ( const [pack, index] of Object.entries(indexes) ) {
		for ( const item of index ) {
			if ( item.type !== type ) continue;
			console.log(`Everyday Heroes | Registering ${item.name} from ${pack}`);
			registerItem(item, `Compendium.${pack}`);
		}
	}
	for ( const item of game.items.values() ) {
		if ( item.type !== type ) continue;
		console.log(`Everyday Heroes | Registering ${item.name} in world`);
		registerItem(item, "Item");
	}
	console.groupEnd();

	return registrations;
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Re-index all Item compendiums to include the identifier.
 * @private
 */
async function _indexCompendiums() {
	return Object.fromEntries(await Promise.all(Array.from(game.packs.entries())
		.filter(p => p[1].metadata.type === "Item")
		.map(async p => [p[0], await p[1].getIndex({ fields: ["system.identifier.value"] })])
	));
}
