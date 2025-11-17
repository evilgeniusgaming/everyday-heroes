import JournalEntrySheetEH from "./journal-entry-sheet.mjs";
import JournalSheetEH from "./journal-sheet.mjs";

Hooks.on("renderJournalEntryPageSheet", JournalEntrySheetEH.onRenderJournalPageSheet);
Hooks.on("renderJournalEntryPageProseMirrorSheet", JournalSheetEH.onRenderJournalEntryPageProseMirrorSheet);

export { JournalEntrySheetEH, JournalSheetEH };
