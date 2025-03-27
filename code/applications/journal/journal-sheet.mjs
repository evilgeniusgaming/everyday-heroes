/**
 * Variant of the standard journal sheet to add custom styling.
 */
export default class JournalSheetEH extends (foundry.appv1?.sheets?.JournalSheet ?? JournalSheet) {
	/** @inheritDoc */
	static get defaultOptions() {
		const options = super.defaultOptions;
		options.classes.push("eh-journal");
		return options;
	}

	/* -------------------------------------------- */

	/**
	 * Add class to journal pages also.
	 * @param {JournalPageSheet} page - The journal page application.
	 * @param {jQuery} jQuery - The rendered Application HTML.
	 * @param {object} context - Rendering context provided.
	 */
	static onRenderJournalPageSheet(page, jQuery, context) {
		let element;
		if ( context.editable ) element = jQuery[0];
		else element = jQuery[0].parentElement;
		if ( page.object.parent.sheet instanceof JournalSheetEH ) element?.classList.add("eh-journal");
		const newClass = page.document.getFlag("everyday-heroes", "style")
			?? page.document.parent?.getFlag("everyday-heroes", "style");
		if ( newClass ) element.classList.add(newClass);
	}

	/* -------------------------------------------- */

	/**
	 * Add class to journal ProseMirror editor.
	 * @param {JournalEntryPageProseMirrorSheet} page - The journal page application.
	 * @param {HTMLElement} element - The rendered Application HTML.
	 * @param {object} context - Rendering context provided.
	 * @param {object} options - Rendering options provided.
	 */
	static onRenderJournalEntryPageProseMirrorSheet(page, element, context, options) {
		if ( page.document.parent.sheet instanceof JournalSheetEH ) {
			element.classList.add("eh-journal", "themed", "theme-light");
		}
	}
}
