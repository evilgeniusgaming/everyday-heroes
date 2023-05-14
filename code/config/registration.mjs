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

/**
 * Has the initial registration been completed?
 * @type {boolean}
 */
export let ready = false;

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Lookup                                   */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Fetch the item registration for the provided identifier if it exists.
 * @param {string} type - Item type to get.
 * @param {string} identifier - Identifier to get.
 * @returns {ItemRegistration|undefined}
 */
export function get(type, identifier) {
	return all[type]?.[identifier];
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Fetch all registered items of the specified type.
 * @param {string} type - Item type to get.
 * @returns {Object<string, ItemRegistration>|undefined}
 */
export function list(type) {
	return all[type];
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
	const registrations = [];
	for ( const type of Item.TYPES ) {
		const dataModel = CONFIG.Item[game.release.generation > 10 ? "dataModels" : "systemDataModels"][type];
		if ( !dataModel?.metadata?.register ) continue;
		registrations.push(_registerItemType(type, indexes));
	}

	// When all settled, populate registration, set to ready, and emit registration complete hook
	Promise.all(registrations).then(registrations => {
		registrations.forEach(r => all[r.type] = r.registrations);
		ready = true;
		console.log("Everyday Heroes | Central item registration setup complete");

		/**
		 * A hook event that fires when startup item registration is complete.
		 * @function everydayHeroes.registrationComplete
		 * @memberof hookEvents
		 */
		Hooks.callAll("everydayHeroes.registrationComplete");
	});
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Register all items of the specified type within compendiums or the world. Should only be called once per item type.
 * @param {string} type - Item type to register.
 * @param {Map[]} [indexes] - Previously prepared indexes of all Item compendiums.
 * @returns {{
 *   type: string,
 *   registrations: Object<string, ItemRegistration>
 * }}
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

	return {type, registrations};
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Enable the hooks needed to handle registration changes during item CRUD operations.
 */
export function setupRegistrationHooks() {
	Hooks.on("createItem", _onCreateItem);
	Hooks.on("preUpdateItem", _preUpdateItem);
	Hooks.on("updateItem", _onUpdateItem);
	Hooks.on("deleteItem", _onDeleteItem);
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

const message = operation => `Everyday Heroes | Attempted to ${operation} item before registration was completed which may lead to invalid registration data. Wait until the "everydayHeroes.registrationComplete" hook has fired or "CONFIG.EverydayHeroes.registration.ready" is true before performing any automatic item management.`;

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Register a new item type when an item is created.
 * @param {ItemEH} item - Newly created item.
 * @param {object} options - Item creation options.
 * @param {string} userId - ID of the user that created the item.
 */
function _onCreateItem(item, options, userId) {
	if ( item.isEmbedded || !item.system.constructor.metadata.register ) return;
	if ( !ready ) console.warn(message("create"));
	let source = all[item.type] ??= {};
	if ( !source ) source = all[item.type] = {};
	_handleCreate(source, item.identifier, item);
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Store the item's identifier before it is changed.
 * @param {ItemEH} item - Updated item.
 * @param {object} changes - Changes being made.
 * @param {object} options - Item update options.
 * @param {string} userId - ID of the user that update the item.
 */
function _preUpdateItem(item, changes, options, userId) {
	options.everydayHeroes ??= {};
	options.everydayHeroes.identifier = item.identifier;
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Update a registered item's name or image if it is the primary for an identifier or move
 * if its identifier has changed.
 * @param {ItemEH} item - Updated item.
 * @param {object} changes - Changes that were made.
 * @param {object} options - Item update options.
 * @param {string} userId - ID of the user that update the item.
 */
function _onUpdateItem(item, changes, options, userId) {
	if ( item.isEmbedded || !item.system.constructor.metadata.register ) return;
	if ( !ready ) console.warn(message("update"));
	const source = all[item.type] ??= {};

	// Identifier has changed, move this to the new location
	if ( item.identifier !== options.everydayHeroes?.identifier ) {
		if ( !source[item.identifier] ) _handleCreate(source, item.identifier, item);
		else source[item.identifier].sources.push(item.uuid);
		_handleDelete(source, options.everydayHeroes.identifier, item);
	} else if ( !source[item.identifier] ) _handleCreate(source, item.identifier, item);

	// Cached values should only be updated if this is the last item in the sources list
	const idx = source[item.identifier].sources.findIndex(i => i === item.uuid);
	if ( idx !== source[item.identifier].sources.length - 1 ) return;
	source[item.identifier].name = item.name;
	source[item.identifier].img = item.img;
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Un-register an item when it has been deleted.
 * @param {ItemEH} item - Deleted item.
 * @param {object} options - Item deletion options.
 * @param {string} userId - ID of the user that deleted the item.
 */
function _onDeleteItem(item, options, userId) {
	if ( item.isEmbedded || !item.system.constructor.metadata.register ) return;
	if ( !ready ) console.warn(message("delete"));
	const source = all[item.type] ??= {};
	if ( !source?.[item.identifier] ) return;
	_handleDelete(source, item.identifier, item);
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Utils                                    */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Handle creating an entry.
 * @param {Object<string, ItemRegistration>} source - Item registration for this item's type.
 * @param {string} identifier - Identifier to use for creating the entry.
 * @param {ItemEH} item - Item being created.
 */
function _handleCreate(source, identifier, item) {
	source[identifier] ??= { sources: [] };
	source[identifier].name = item.name;
	source[identifier].img = item.img;
	source[identifier].sources.push(item.uuid);
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Handle deleting an entry.
 * @param {Object<string, ItemRegistration>} source - Item registration for this item's type.
 * @param {string} identifier - Identifier to use when deleting entry.
 * @param {ItemEH} item - Item being deleted.
 */
function _handleDelete(source, identifier, item) {
	source[identifier].sources.findSplice(i => i === item.uuid);
	if ( source[identifier].sources.length === 0 ) {
		delete source[identifier];
		return;
	}
	const newSource = fromUuidSync(source[identifier].sources[source[identifier].sources.length - 1]);
	source[identifier].name = newSource.name;
	source[identifier].img = newSource.img;
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
