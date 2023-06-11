/**
 * Insert custom classes into journal page headers.
 * @param {JournalPageSheet} app
 * @param {jQuery} jQuery
 * @param {object} options
 */
export function renderJournalPageSheet(app, jQuery, options) {
	const newClass = app.document.getFlag("everyday-heroes", "style")
		?? app.document.parent?.getFlag("everyday-heroes", "style");
	if ( !newClass ) return;
	const container = jQuery[0].classList.contains("journal-sheet") ? jQuery[0] : jQuery[0].parentElement;
	container.classList.add(newClass);
}
