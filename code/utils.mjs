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

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Array Helpers                            */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Insert a new element into an array in a specific position.
 * @param {Array} array - Array into which to insert.
 * @param {*} toInsert - Element to insert.
 * @param {{after: [*|Function], before: [*|Function]}[]} positions - List of objects that describe where the new
 *                                                                    element should be inserted, if matching elements
 *                                                                    are found, or functions to call to do the same.
 * @returns {number} - Index of the newly inserted element.
 */
export function insertBetween(array, toInsert, positions) {
	for ( const position of positions ) {
		let matcher = position.after ?? position.before;
		if ( foundry.utils.getType(matcher) !== "function" ) matcher = e => e === (position.after ?? position.before);
		let insertIdx = array.findIndex(matcher);
		if ( insertIdx === -1 ) continue;
		if ( position.after ) insertIdx += 1;
		array.splice(insertIdx, 0, toInsert);
		return insertIdx;
	}
	array.push(toInsert);
	return array.length - 1;
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Object Helpers                           */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Filter an object using the provided function.
 * @param {object} obj - Object to filter.
 * @param {Function} filter - Function to use for filtering.
 * @returns {object}
 */
export function filterObject(obj, filter) {
	return Object.fromEntries(
		Object.entries(obj).filter(([k, v]) => filter(v))
	);
}

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
	const sort = (a, b) => foundry.utils.getType(a) === "string" ? a.localeCompare(b) : a - b;
	if ( sortKey ) sorted = sorted.sort((a, b) => sort(a[1][sortKey], b[1][sortKey]));
	else sorted = sorted.sort((a, b) => sort(a[1], b[1]));
	return Object.fromEntries(sorted);
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Text Helpers                             */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Slugify the provided string with additional improvements to handle works separated by slashes
 * (e.g. `this/that` becomes `this-that` rather than `thisthat`).
 * @param {string} text - Text to slugify.
 * @param {object} options - Options passed to the core slugify function.
 * @returns {string}
 */
export function slugify(text, options) {
	text = text.replaceAll(/(\w+)([\\|/])(\w+)/g, "$1-$3");
	return text.slugify(options);
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Validators                               */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Ensure the provided string contains only the characters allowed in identifiers.
 * @param {string} identifier - Identifier to verify.
 * @returns {boolean}
 */
function isValidIdentifier(identifier) {
	return /^([a-z0-9_-]+)$/i.test(identifier);
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Determine whether the provided unit is usable within `Intl.NumberFormat`.
 * @param {string} unit
 * @returns {boolean}
 */
function isValidUnit(unit) {
	try {
		const formatter = new Intl.NumberFormat(game.i18n.lang, { style: "unit", unit });
		formatter.format(1);
		return true;
	} catch(err) {
		return false;
	}
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

export const validators = {
	isValidIdentifier,
	isValidUnit
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
	for ( let [key, value] of Object.entries(context ?? {}) ) {
		key = key.replace(/[A-Z]+(?![a-z])|[A-Z]/g, (a, b) => (b ? "-" : "") + a.toLowerCase());
		entries.push(`data-${key}="${value}"`);
	}
	return new Handlebars.SafeString(entries.join(" "));
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * A helper to create a set of <option> elements in a <select> block grouped together
 * in <optgroup> based on the provided categories.
 *
 * @param {SelectChoices} choices - Choices to format.
 * @param {object} [options]
 * @param {boolean} [options.localize] - Should the label be localized?
 * @param {string} [options.blank] - Name for the empty option, if one should be added.
 * @param {string} [options.labelAttr] - Attribute pointing to label string.
 * @param {string} [options.chosenAttr] - Attribute pointing to chosen boolean.
 * @param {string} [options.childrenAttr] - Attribute pointing to array of children.
 * @returns {Handlebars.SafeString} - Formatted option list.
 */
function groupedSelectOptions(choices, options) {
	const localize = options.localize ?? false;
	const blank = options.blank ?? null;
	const labelAttr = options.labelAttr ?? "label";
	const chosenAttr = options.chosenAttr ?? "chosen";
	const childrenAttr = options.childrenAttr ?? "children";

	// Create an option
	const option = (name, label, chosen) => {
		if ( localize ) label = game.i18n.localize(label);
		html += `<option value="${name}" ${chosen ? "selected" : ""}>${label}</option>`;
	};

	// Create an group
	const group = category => {
		let label = category[labelAttr];
		if ( localize ) game.i18n.localize(label);
		html += `<optgroup label="${label}">`;
		children(category[childrenAttr]);
		html += "</optgroup>";
	};

	// Add children
	const children = children => {
		for ( let [name, child] of Object.entries(children) ) {
			if ( child[childrenAttr] ) group(child);
			else option(name, child[labelAttr], child[chosenAttr] ?? false);
		}
	};

	// Create the options
	let html = "";
	if ( blank !== null ) option("", blank);
	children(choices);
	return new Handlebars.SafeString(html);
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
	if ( arguments.length !== 2 ) throw new Error("#everydayHeroes-itemContext requires exactly one argument");
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
 * Stringify the provided object as JSON.
 * @param {object} context - Current evaluation context.
 * @param {object} options - Handlebars options.
 * @returns {string}
 */
function jsonStringify(context, options) {
	const string = encodeURI(JSON.stringify(context));
	return string;
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Format a number based on the current locale.
 * @param {number} value - A numeric value to format.
 * @param {object} [options={}]
 * @param {number} [options.decimals] - Number of decimal digits to display.
 * @param {number} [options.digits] - Number of digits before the decimal point to display.
 * @param {boolean} [options.sign] - Should the sign always be displayed?
 * @param {string} [options.unit] - What unit should be displayed?
 * @param {string} [options.unitDisplay] - Unit display style.
 * @returns {string}
 */
export function numberFormat(value, options={}) {
	const formatterOptions = {};
	if ( options.sign ) formatterOptions.signDisplay = "always";
	if ( options.decimals !== undefined ) {
		formatterOptions.minimumFractionDigits = options.decimals;
		formatterOptions.maximumFractionDigits = options.decimals;
	}
	if ( options.digits !== undefined ) {
		formatterOptions.minimumIntegerDigits = options.digits;
		formatterOptions.maximumIntegerDigits = options.digits;
	}
	if ( options.unit ) {
		formatterOptions.style = "unit";
		formatterOptions.unit = options.unit;
		formatterOptions.unitDisplay = options.unitDisplay;
	}

	try {
		const formatter = new Intl.NumberFormat(game.i18n.lang, formatterOptions);
		return formatter.format(value);
	} catch(error) {
		console.warn(error);
		delete formatterOptions.style;
		delete formatterOptions.unit;
		const formatter = new Intl.NumberFormat(game.i18n.lang, formatterOptions);
		return formatter.format(value);
	}
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Create a tag input.
 * @param {string[]|Set<string>} selected - Array or set of currently selected options.
 * @param {object} options
 * @returns {Handlebars.SafeString}
 */
export function tagInput(selected, options={}) {
	let { choices, name, labelAttr="label", disabledAttr="disabled", validate=false } = options.hash ?? {};
	if ( !name ) throw new Error("Name must be defined on a tag input.");

	// Pre-process choices
	choices = Object.entries(choices ?? {}).reduce((obj, [key, choice]) => {
		obj[key] = {
			label: foundry.utils.getType(choice) !== "Object" ? choice : choice[labelAttr],
			disabled: choice[disabledAttr]
				?? (foundry.utils.getType(selected) === "Array" ? selected.includes(key) : selected.has(key))
		};
		return obj;
	}, {});

	// Build list of tags
	const tags = [];
	for ( const key of selected ) {
		tags.push(`
			<span class="tag" data-key="${key}">
		  	${choices?.[key]?.label ?? key} <a data-action="delete"><i class="fa-solid fa-delete-left"></i></a>
			</span>
		`);
	}

	// Build input and data list
	const dataOptions = [];
	for ( const [key, choice] of Object.entries(choices) ) {
		dataOptions.push(`<option value="${key}" label="${choice.label}" ${choice.disabled ? "disabled" : ""}>`);
	}
	const listId = `list-${name}-${options.data.root.document?.id}`;
	const input = dataOptions.length
		? `<input type="text" list="${listId}"><datalist id="${listId}">${dataOptions}</datalist>`
		: '<input type="text">';

	// Put it all together
	const validation = validate ? 'data-validate="true"' : "";
	return new Handlebars.SafeString(`
		<div class="tag-input" data-target="${name}" ${validation}>
			${tags.join("\n")}
			${input}
		</div>
	`);
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Register sheet listeners for the tag input.
 * @param {DocumentSheet} sheet - Sheet that might contain a tag input.
 * @param {HTMLElement} html - HTML of the sheet.
 */
export function registerTagInputListeners(sheet, html) {
	for ( const element of html.querySelectorAll(".tag-input input") ) {
		element.addEventListener("change", handleTagInputAction.bind(sheet, "add"));
	}
	for ( const element of html.querySelectorAll('.tag-input [data-action="delete"]') ) {
		element.addEventListener("click", handleTagInputAction.bind(sheet, "delete"));
	}
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Handle actions associated with tag inputs.
 * @param {string} type - Action type being handled.
 * @param {ClickEvent} event - Triggering click event.
 * @returns {Promise}
 */
export async function handleTagInputAction(type, event) {
	event.preventDefault();
	const tagInput = event.target.closest(".tag-input");
	if ( !tagInput ) return;
	const name = tagInput.dataset.target;
	const shouldValidate = tagInput.dataset.validate;
	const collection = foundry.utils.getProperty(this.document.toObject(), name);

	switch (type) {
		case "add":
			const validOptions = Array.from(event.target.list?.options ?? []).map(o => o.value);
			if ( shouldValidate && !validOptions.includes(event.target.value) ) return;
			collection.push(event.target.value);
			break;
		case "delete":
			const key = event.target.closest("[data-key]")?.dataset.key;
			collection.findSplice(v => v === key);
			break;
		default:
			return console.warn(`Invalid tag action type ${type}`);
	}
	this.document.update({[name]: Array.from(collection)});
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Register custom Handlebars helpers for use by the system.
 */
export function registerHandlebarsHelpers() {
	Handlebars.registerHelper({
		"everydayHeroes-dataset": dataset,
		"everydayHeroes-groupedSelectOptions": (choices, options) => groupedSelectOptions(choices, options.hash),
		"everydayHeroes-has": has,
		"everydayHeroes-itemContext": itemContext,
		"everydayHeroes-jsonStringify": jsonStringify,
		"everydayHeroes-linkForUUID": linkForUUID,
		"everydayHeroes-number": (value, options) => numberFormat(value, options.hash),
		"everydayHeroes-tagInput": tagInput
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
		"actor/actor-inventory.hbs",
		"actor/actor-proficiency-selector.hbs",
		"actor/hero-biography.hbs",
		"actor/hero-details.hbs",
		"actor/hero-persona.hbs",
		"actor/npc-details.hbs",
		"advancement/parts/advancement-ability-score-control.hbs",
		"advancement/parts/advancement-controls.hbs",
		"advancement/parts/advancement-scale-value.hbs",
		"item/feature-details.hbs",
		"item/item-advancement.hbs",
		"item/item-description.hbs",
		"item/item-summary.hbs",
		"item/physical-damage.hbs",
		"item/physical-details.hbs",
		"item/physical-rounds.hbs",
		"shared/active-effects.hbs"
	];

	const paths = {};
	for ( let path of partials ) {
		path = `systems/everyday-heroes/templates/${path}`;
		paths[path] = path;
		paths[`everydayHeroes.${path.split("/").pop().replace(".hbs", "")}`] = path;
	}

	return loadTemplates(paths);
}
