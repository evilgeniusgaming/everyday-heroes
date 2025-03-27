import JournalSheetEH from "./journal-sheet.mjs";

Hooks.on("renderJournalPageSheet", JournalSheetEH.onRenderJournalPageSheet);
Hooks.on("renderJournalEntryPageProseMirrorSheet", JournalSheetEH.onRenderJournalEntryPageProseMirrorSheet);

export { JournalSheetEH };
