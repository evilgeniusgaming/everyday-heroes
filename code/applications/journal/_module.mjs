import JournalSheetEH from "./journal-sheet.mjs";

Hooks.on("renderJournalEntryPageProseMirrorSheet", JournalSheetEH.onRenderJournalEntryPageProseMirrorSheet);

export { JournalSheetEH };
