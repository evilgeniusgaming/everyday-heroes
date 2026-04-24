/**
 * Variant of the standard journal sheet to add custom styling.
 */
export default class JournalEntrySheetEH extends foundry.applications.sheets.journal.JournalEntrySheet {
	/** @override */
	static DEFAULT_OPTIONS = {
		classes: ["eh-journal"]
	};

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Rendering                                */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Add Everyday Heroes class to individual journal pages.
	 * @param {JournalEntryPageSheet} page - The page application.
	 * @param {HTMLElement} element - The page application's rendered element.
	 */
	static onRenderJournalPageSheet(page, element) {
		if (page.document.parent?.sheet instanceof JournalEntrySheetEH) {
			const newClass = page.document.getFlag("everyday-heroes", "style")
				?? page.document.parent?.getFlag("everyday-heroes", "style");
			element.classList.add("everyday-heroes", "eh-journal", "themed", "theme-light");
			if ( newClass ) element.classList.add(newClass);
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @override */
	async _renderPageView(element, sheet) {
		await super._renderPageView(element, sheet);
		const newClass = this.document.getFlag("everyday-heroes", "style");
		if ( newClass ) element.classList.add(newClass);
	}
}
