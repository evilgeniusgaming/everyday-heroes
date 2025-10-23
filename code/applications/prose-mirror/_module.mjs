import getProseMirrorMenuDropDowns from "./menus.mjs";

/**
 * Register hooks related to ProseMirror enhancements.
 */
export function registerHooks() {
	Hooks.on("getProseMirrorMenuDropDowns", getProseMirrorMenuDropDowns);
}
