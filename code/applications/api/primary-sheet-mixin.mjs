/**
 * Adds V2 sheet functionality shared between primary document sheets (Actors & Items).
 * @param {typeof EHDocumentSheet} Base - The base class being mixed.
 * @returns {typeof EHPrimarySheet}
 */
export default function PrimarySheetMixin(Base) {
	return class EHPrimarySheet extends Base {
		/** @override */
		static DEFAULT_OPTIONS = {
			actions: {
				addDocument: EHPrimarySheet.#onAddDocument,
				editDocument: EHPrimarySheet.#onShowDocument,
				deleteDocument: EHPrimarySheet.#onDeleteDocument,
				showDocument: EHPrimarySheet.#onShowDocument,
				toggleEffect: EHPrimarySheet.#onToggleEffect
			}
		};

		/* -------------------------------------------- */
		/*  Properties                                  */
		/* -------------------------------------------- */

		/** @override */
		get title() {
			return this.document.name;
		}

		/* -------------------------------------------- */
		/*  Rendering                                   */
		/* -------------------------------------------- */

		/** @inheritDoc */
		async _preparePartContext(partId, context, options) {
			context = await super._preparePartContext(partId, context, options);
			context.tab = context.tabs[partId];
			return context;
		}

		/* -------------------------------------------- */
		/*  Event Listeners and Handlers                */
		/* -------------------------------------------- */

		/**
		 * Handle adding an document.
		 * @this {EHPrimarySheet}
		 * @param {Event} event - Triggering click event.
		 * @param {HTMLElement} target - Button that was clicked.
		 */
		static async #onAddDocument(event, target) {
			await this._onAddDocument(event, target);
		}

		/* -------------------------------------------- */

		/**
		 * Handle creating a new embedded child.
		 * @param {Event} event - Triggering click event.
		 * @param {HTMLElement} target - Button that was clicked.
		 * @returns {any}
		 * @protected
		 * @abstract
		 */
		_onAddDocument(event, target) {}

		/* -------------------------------------------- */

		/**
		 * Handle removing an document.
		 * @this {EHPrimarySheet}
		 * @param {Event} event - Triggering click event.
		 * @param {HTMLElement} target - Button that was clicked.
		 */
		static async #onDeleteDocument(event, target) {
			if ( await this._onDeleteDocument(event, target) === false ) return;
			const uuid = target.closest("[data-uuid]")?.dataset.uuid;
			const doc = await fromUuid(uuid);
			doc?.deleteDialog({ sheet: this });
		}

		/* -------------------------------------------- */

		/**
		 * Handle removing an document.
		 * @param {Event} event - Triggering click event.
		 * @param {HTMLElement} target - Button that was clicked.
		 * @returns {any} - Return `false` to prevent default behavior.
		 */
		async _onDeleteDocument(event, target) {}

		/* -------------------------------------------- */

		/**
		 * Open a document's sheet, rendering it as a child of this application if supported.
		 * @param {Document} doc - The document whose sheet should be opened.
		 * @param {RenderOptions} [options] - Options passed to render.
		 * @protected
		 */
		_openDocumentSheet(doc, options={}) {
			if ( doc?.sheet ) this._renderChild(doc.sheet, options);
		}

		/* -------------------------------------------- */

		/** @override */
		_onRevealSecret(event) {
			if ( super._onRevealSecret(event) ) return;
			const target = event.target.closest("[data-target]")?.dataset.target;
			if ( !target ) return;
			const content = foundry.utils.getProperty(this.document, target);
			const modified = event.target.toggleRevealed(content);
			this.document.update({ [target]: modified });
		}

		/* -------------------------------------------- */

		/**
		 * Handle opening a document sheet.
		 * @this {EHPrimarySheet}
		 * @param {Event} event - Triggering click event.
		 * @param {HTMLElement} target - Button that was clicked.
		 */
		static async #onShowDocument(event, target) {
			if ( await this._onShowDocument(event, target) === false ) return;
			if ( [HTMLInputElement, HTMLSelectElement].some(el => event.target instanceof el) ) return;
			const uuid = target.closest("[data-uuid]")?.dataset.uuid;
			const doc = await fromUuid(uuid);
			this._openDocumentSheet(doc, { force: true });
		}

		/* -------------------------------------------- */

		/**
		 * Handle opening a document sheet.
		 * @param {Event} event - Triggering click event.
		 * @param {HTMLElement} target - Button that was clicked.
		 * @returns {any}               Return `false` to prevent default behavior.
		 */
		async _onShowDocument(event, target) {}

		/* -------------------------------------------- */

		/**
		 * Handle toggling an active effect.
		 * @this {EHPrimarySheet}
		 * @param {Event} event - Triggering click event.
		 * @param {HTMLElement} target - Button that was clicked.
		 */
		static #onToggleEffect(event, target) {
			const { effectId, parentId } = target.closest("[data-effect-id]")?.dataset ?? {};
			const effect = parentId
				? this.document.items.get(parentId)?.effects.get(effectId)
				: this.document.effects.get(effectId);
			effect?.update({ disabled: !effect.disabled });
		}
	};
}
