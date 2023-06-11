export {default as BaseItemSheet} from "./base-item-sheet.mjs";
export {default as ConceptSheet} from "./concept-sheet.mjs";
export {default as FeatureSheet} from "./feature-sheet.mjs";
export {default as PhysicalSheet} from "./physical-sheet.mjs";

/**
 * Insert custom classes into item sheet headers.
 * @param {ItemSheet} app
 * @param {jQuery} jQuery
 * @param {object} options
 */
export function renderItemSheet(app, jQuery, options) {
	const newClass = app.document.getFlag("everyday-heroes", "source");
	if ( !newClass ) return;
	const container = jQuery[0];
	console.log(newClass, container);
	container.classList.add(newClass);
}
