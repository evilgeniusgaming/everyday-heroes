/**
 * Register new menus in ProseMirror for system-specific styling.
 */
export default function getProseMirrorMenuDropDowns(proseMirrorMenu, dropdowns) {
	if ( !game.settings.get(game.system.id, "developerTools") ) return;
	for ( const [dropdownKey, entries] of Object.entries(MENUS) ) {
		const dropdown = dropdowns[dropdownKey];
		if ( !dropdown ) continue;
		for ( const [action, children] of Object.entries(entries) ) {
			const entry = dropdown.entries.find(e => e.action === action);
			if ( !entry ) continue;
			entry.children.push(...children.flatMap(c => c(proseMirrorMenu)));
		}
	}
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

const MENUS = {
	format: {
		headings: [headers],
		block: [readAloud, calloutBlock],
		inline: [characterQuote]
	}
};

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Generate a menu item for grouping the selected text into a callout box.
 * @param {ProseMirrorMenu} proseMirrorMenu
 * @returns {ProseMirrorMenuItem[]}
 *
 * @example
 * ```html
 * <div class="callout">
 *   <h4>Important Info</h4>
 *   <p>Here is some important information for the GM.</p>
 * </div>
 * ```
 */
function calloutBlock(proseMirrorMenu) {
	return [{
		action: "eh-calloutBlock",
		title: game.i18n.localize("EH.ProseMirror.Command.Callout"),
		class: "eh-menu-item",
		node: proseMirrorMenu.schema.marks.div,
		attrs: { _preserve: { class: "callout" } },
		cmd: () => proseMirrorMenu._toggleBlock(
			proseMirrorMenu.schema.nodes.div,
			ProseMirror.commands.wrapIn,
			{ attrs: { _preserve: { class: "callout" } } }
		)
	}];
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Generate a menu item for turning selected text into a character quote.
 * @param {ProseMirrorMenu} proseMirrorMenu
 * @returns {ProseMirrorMenuItem[]}
 *
 * @example
 * ```html
 * <q class="character">This is something a character says.</q>
 * ```
 */
function characterQuote(proseMirrorMenu) {
	return [{
		action: "eh-characterQuote",
		title: game.i18n.localize("EH.ProseMirror.Command.CharacterQuote"),
		class: "eh-menu-item",
		mark: proseMirrorMenu.schema.marks.q,
		attrs: { _preserve: { class: "character" } },
		cmd: ProseMirror.commands.toggleMark(proseMirrorMenu.schema.marks.q, { _preserve: { class: "character" } })
	}];
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Generate a menu item for turning some text into a menu quote.
 * @param {ProseMirrorMenu} proseMirrorMenu
 * @returns {ProseMirrorMenuItem[]}
 *
 * @example
 * ```html
 * <h3 class="alt">Alternate H3</h3>
 * <h3 class="rounded">Rounded H3</h3>
 * <h4 class="alt">Alternate H4</h4>
 * <h4 class="rounded">Rounded H4</h4>
 * ```
 */
function headers(proseMirrorMenu) {
	const headers = [[3, "alt"], [3, "rounded"], [4, "alt"], [4, "rounded"]];
	return headers.map(([level, variant]) => ({
		action: `eh-h${level}${variant}`,
		title: game.i18n.localize(`EH.ProseMirror.Command.HeaderH${level}${variant.capitalize()}`),
		class: `eh-menu-item level${level} header-${variant}`,
		node: proseMirrorMenu.schema.nodes.heading,
		attrs: { level, _preserve: { class: variant } },
		cmd: () => proseMirrorMenu._toggleTextBlock(
			proseMirrorMenu.schema.nodes.heading,
			{ attrs: { level, _preserve: { class: variant } } }
		)
	}));
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Generate a menu item for turning some text into a menu quote.
 * @param {ProseMirrorMenu} proseMirrorMenu
 * @returns {ProseMirrorMenuItem[]}
 *
 * @example
 * ```html
 * <p class="header">
 *   <q>This is a quotation that starts the chapter.</q> <cite>—Name</cite>
 * </p>
 * ```
 */
function headingQuote(proseMirrorMenu) {
	// TODO: Figure out how to get this working
	return [{
		action: "eh-quoteHeading",
		title: game.i18n.localize("EH.ProseMirror.Command.HeaderQuote"),
		class: "eh-menu-item",
		node: proseMirrorMenu.schema.nodes.paragraph,
		attrs: { _preserve: { class: "header" } },
		cmd: ProseMirror.commands.chainCommands(
			ProseMirror.commands.toggleMark(proseMirrorMenu.schema.marks.q),
			ProseMirror.commands.wrapIn(proseMirrorMenu.schema.nodes.paragraph, { _preserve: { class: "header" } })
		)
	}];
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Generate a menu item for turning selected text into a read aloud block.
 * @param {ProseMirrorMenu} proseMirrorMenu
 * @returns {ProseMirrorMenuItem[]}
 *
 * @example
 * ```html
 * <blockquote class="read-aloud">
 *   <p>This will be read aloud by the game master.</p>
 * </blockquote>
 * ```
 */
function readAloud(proseMirrorMenu) {
	return [{
		action: "eh-readAloud",
		title: game.i18n.localize("EH.ProseMirror.Command.ReadAloud"),
		class: "eh-menu-item",
		mark: proseMirrorMenu.schema.nodes.blockquote,
		attrs: { _preserve: { class: "read-aloud" } },
		cmd: () => proseMirrorMenu._toggleBlock(
			proseMirrorMenu.schema.nodes.blockquote,
			ProseMirror.commands.wrapIn,
			{ attrs: { _preserve: { class: "read-aloud" } } }
		)
	}];
}
