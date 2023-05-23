/**
 * Extended version of `JournalSheet` to support custom styling.
 */
export default class JournalSheetEH extends JournalSheet {
	constructor(options={}) {
		super(options);
		const newClass = this.document.getFlag("everyday-heroes", "style");
		if ( newClass ) this.options.classes.push(newClass);
	}
}
