/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Formulas                                 */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Convert a bonus value to a simple integer for displaying on the sheet.
 * @param {number|string|null} bonus - Bonus formula.
 * @param {object} [data={}] - Data to use for replacing @ strings.
 * @returns {number} - Simplified bonus as an integer.
 */
export function simplifyBonus(bonus, data={}) {
	if ( !bonus ) return 0;
	if ( Number.isNumeric(bonus) ) return Number(bonus);
	try {
		const roll = new Roll(bonus, data);
		return roll.isDeterministic ? Roll.safeEval(roll.formula) : 0;
	} catch(error) {
		console.error(error);
		return 0;
	}
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Object Helpers                           */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Convert a object that contains boolean values to a set of keys whose values were `true`.
 * @param {Object<string, boolean>} obj
 * @returns {Set<string>}
 */
export function objectToSet(obj) {
	return Object.entries(obj).reduce((set, [k, v]) => {
		if ( v === true ) set.add(k);
		return set;
	}, new Set());
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Sort the provided object by its values or by an inner sortKey.
 * @param {object} obj - The object to sort.
 * @param {string} [sortKey] - An inner key upon which to sort.
 * @returns {object} - A copy of the original object that has been sorted.
 */
export function sortObjectEntries(obj, sortKey) {
	let sorted = Object.entries(obj);
	if ( sortKey ) sorted = sorted.sort((a, b) => a[1][sortKey].localeCompare(b[1][sortKey]));
	else sorted = sorted.sort((a, b) => a[1].localeCompare(b[1]));
	return Object.fromEntries(sorted);
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Document Helpers                         */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Creates an HTML document link for the provided UUID.
 * @param {string} uuid - UUID for which to produce the link.
 * @returns {string} - Link to the item or empty string if item wasn't found.
 */
export function linkForUUID(uuid) {
	return TextEditor._createContentLink(["", "UUID", uuid]).outerHTML;
}

/* -------------------------------------------- */
/*  Validators                                  */
/* -------------------------------------------- */

/**
 * Ensure the provided string contains only the characters allowed in identifiers.
 * @param {string} identifier - Identifier to verify.
 * @returns {boolean}
 */
function isValidIdentifier(identifier) {
	return /^([a-z0-9_-]+)$/i.test(identifier);
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

export const validators = {
	isValidIdentifier: isValidIdentifier
};

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Handlebars Helpers                       */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * A helper that converts the provided object into a series of `data-` entries.
 * @param {object} context - Current evaluation context.
 * @param {object} options - Handlebars options.
 * @returns {string}
 */
function dataset(context, options) {
	const entries = [];
	for ( let [key, value] of Object.entries(context) ) {
		key = key.replace(/[A-Z]+(?![a-z])|[A-Z]/g, (a, b) => (b ? "-" : "") + a.toLowerCase());
		entries.push(`data-${key}="${value}"`);
	}
	return new Handlebars.SafeString(entries.join(" "));
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * A helper that determines if the provided item has a certain property.
 * @param {object} context - Current evaluation context.
 * @param {object} options - Handlebars options.
 * @returns {boolean}
 */
function has(context, options) {
	return foundry.utils.getProperty(context, options) !== undefined;
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * A helper that fetch the appropriate item context from root and adds it to the first block parameter.
 * @param {object} context - Current evaluation context.
 * @param {object} options - Handlebars options.
 * @returns {string}
 */
function itemContext(context, options) {
	if ( arguments.length !== 2 ) throw new Error("#eh-itemContext requires exactly one argument");
	if ( foundry.utils.getType(context) === "function" ) context = context.call(this);

	const ctx = options.data.root.itemContext?.[context.id];
	if ( !ctx ) {
		const inverse = options.inverse(this);
		if ( inverse ) return options.inverse(this);
	}

	return options.fn(context, { data: options.data, blockParams: [ctx] });
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Register custom Handlebars helpers for use by the system.
 */
export function registerHandlebarsHelpers() {
	Handlebars.registerHelper({
		"everydayHeroes-dataset": dataset,
		"everydayHeroes-has": has,
		"everydayHeroes-itemContext": itemContext,
		"everydayHeroes-linkForUUID": linkForUUID
	});
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Handlebars Partials                      */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Register & pre-load handlebars partial templates.
 * @returns {Promise}
 */
export async function registerHandlebarsPartials() {
	const partials = [
		"actor/parts/actor-proficiency-selector.hbs",
		"actor/hero-biography.hbs",
		"actor/hero-details.hbs",
		"actor/hero-features.hbs",
		"actor/hero-inventory.hbs",
		"advancement/parts/advancement-controls.hbs",
		"item/physical-details.hbs"
	];

	const paths = {};
	for ( let path of partials ) {
		path = `systems/everyday-heroes/templates/${path}`;
		paths[path] = path;
		paths[`everydayHeroes.${path.split("/").pop().replace(".hbs", "")}`] = path;
	}

	return loadTemplates(paths);
}
