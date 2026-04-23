const { HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Mixin method for ApplicationV2-based applications.
 * @template {ApplicationV2} T
 * @param {typeof T} Base - Application class being extended.
 * @param {object} [options={}]
 * @param {boolean} [options.handlebars=true] - Include HandlebarsApplicationMixin.
 * @returns {typeof BaseApplicationV2}
 * @mixin
 */
export default function ApplicationV2Mixin(Base, { handlebars=true }={}) {
	const _BaseApplicationV2 = handlebars ? HandlebarsApplicationMixin(Base) : Base;
	class BaseApplicationV2 extends _BaseApplicationV2 {
		/** @override */
		static DEFAULT_OPTIONS = {
			actions: {
				toggleCollapsed: BaseApplicationV2.#toggleCollapsed
			},
			classes: ["everyday-heroes"]
		};

		/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
		/*  Properties                               */
		/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

		/**
		 * Expanded states for collapsible sections to persist between renders.
		 * @type {Map<string, boolean>}
		 */
		#expandedSections = new Map();

		get expandedSections() {
			return this.#expandedSections;
		}

		/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
		/*  Rendering                                */
		/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

		/** @inheritDoc */
		_configureRenderParts(options) {
			const parts = super._configureRenderParts(options);
			for ( const [id, { visible }] of Object.entries(parts) ) {
				if ( !visible || visible(this.document) ) continue;
				delete parts[id];
			}
			return parts;
		}

		/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

		/** @inheritDoc */
		_onFirstRender(context, options) {
			super._onFirstRender(context, options);
			this._renderContainers(context, options);
		}

		/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

		/** @inheritDoc */
		async _prepareContext(options) {
			const context = await super._prepareContext(options);
			context.CONFIG = CONFIG.EverydayHeroes;
			return context;
		}

		/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

		/** @inheritDoc */
		async _preparePartContext(partId, context, options) {
			return { ...await super._preparePartContext(partId, context, options) };
		}

		/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

		/** @inheritDoc */
		_prepareTabs(group) {
			const tabs = super._prepareTabs(group);
			for ( const id of Object.keys(tabs) ) {
				const visible = this.constructor.PARTS[id]?.visible;
				if ( !visible || visible(this.document) ) continue;
				delete tabs[id];
			}
			return tabs;
		}

		/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

		/**
		 * Lazily create containers and place parts appropriately.
		 * @param {object} context - Render context.
		 * @param {object} options - Render options.
		 * @protected
		 */
		_renderContainers(context, options) {
			const containerElements = Array.from(this.element.querySelectorAll("[data-container-id]"));
			const containers = Object.fromEntries(containerElements.map(el => [el.dataset.containerId, el]));
			for ( const [part, config] of Object.entries(this.constructor.PARTS) ) {
				if ( !config.container?.id ) continue;
				const element = this.element.querySelector(`[data-application-part="${part}"]`);
				if ( !element ) continue;
				let container = containers[config.container.id];
				if ( !container ) {
					const div = document.createElement("div");
					div.dataset.containerId = config.container.id;
					div.classList.add(...config.container.classes ?? []);
					container = containers[config.container.id] = div;
					element.replaceWith(div);
				}
				if ( element.parentElement !== container ) container.append(element);
			}
		}

		/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

		/** @inheritDoc */
		_replaceHTML(result, content, options) {
			for ( const part of Object.values(result) ) {
				for ( const element of part.querySelectorAll("[data-expand-id]") ) {
					element.querySelector(".collapsible")?.classList
						.toggle("collapsed", !this.#expandedSections.get(element.dataset.expandId));
				}
			}
			super._replaceHTML(result, content, options);
		}

		/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

		/** @inheritDoc */
		async _onRender(context, options) {
			await super._onRender(context, options);

			// Add special styling for label-top & label-hinted hints
			this.element.querySelectorAll(":is(.label-top, .label-hinted) > p.hint").forEach(hint => {
				const label = hint.parentElement.querySelector(":scope > label");
				if ( !label ) return;
				hint.ariaLabel = hint.innerText;
				hint.dataset.tooltip = hint.innerHTML;
				hint.innerHTML = "";
				label.classList.add("hinted-label");
				label.insertAdjacentElement("beforeend", hint);
			});

			// Move label contents to aria-label for .label-hidden
			this.element.querySelectorAll(".label-hidden").forEach(group => {
				const label = group.querySelector(":scope > label");
				if ( !label?.innerText ) return;
				const input = group.querySelector(":scope > .form-fields > :is(input, select)");
				if ( !input || input.ariaLabel || input.ariaLabeledBy ) return;
				input.ariaLabel = label.innerText;
			});
		}

		/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

		/**
		 * Disable form fields that aren't marked with the `always-interactive` class.
		 */
		_disableFields() {
			const selector = `.window-content :is(${[
				"INPUT", "SELECT", "TEXTAREA", "BUTTON", "COLOR-PICKER", "DOCUMENT-TAGS",
				"FILE-PICKER", "FORMULA-INPUT", "HUE-SLIDER", "MULTI-SELECT", "PROSE-MIRROR",
				"RANGE-PICKER", "STRING-TAGS"
			].join(", ")}):not(.always-interactive)`;
			for ( const element of this.element.querySelectorAll(selector) ) {
				if ( element.closest("prose-mirror")?.open ) continue; // Skip active ProseMirror editors
				if ( element.tagName === "TEXTAREA" ) element.readOnly = true;
				else element.disabled = true;
			}
		}

		/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
		/*  Event Listeners and Handlers             */
		/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

		/** @inheritDoc */
		_attachFrameListeners() {
			super._attachFrameListeners();
			this.element.addEventListener("plugins", this._onConfigurePlugins.bind(this));
		}

		/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

		/**
		 * Configure plugins for the ProseMirror instance.
		 * @param {ProseMirrorPluginsEvent} event
		 * @protected
		 */
		_onConfigurePlugins(event) {
			event.plugins.highlightDocumentMatches =
				ProseMirror.ProseMirrorHighlightMatchesPlugin.build(ProseMirror.defaultSchema);
		}

		/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

		/**
		 * Handle toggling the collapsed state of collapsible sections.
		 * @this {BaseApplicationV2}
		 * @param {Event} event - Triggering click event.
		 * @param {HTMLElement} target - Button that was clicked.
		 */
		static #toggleCollapsed(event, target) {
			const collapsible = target.closest(".collapsible");
			if ( !collapsible || event.target.closest(".collapsible-content") ) return;
			collapsible.classList.toggle("collapsed");
			this.#expandedSections.set(
				target.closest("[data-expand-id]")?.dataset.expandId,
				!collapsible.classList.contains("collapsed")
			);
		}

		/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
		/*  Detached Windows                         */
		/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

		/**
		 * Render a confirm dialog as a child of this application.
		 * @param {object} config - Configuration passed to DialogV2.confirm.
		 * @returns {Promise}
		 */
		_confirmDialog(config) {
			const { promise, resolve } = Promise.withResolvers();
			const { yes={}, no={}, ...rest } = config;
			const app = new foundry.applications.api.DialogV2({
				...rest,
				buttons: [
					foundry.utils.mergeObject(
						{ action: "yes", icon: "fa-solid fa-check", label: game.i18n.localize("Yes"), default: true }, yes
					),
					foundry.utils.mergeObject(
						{ action: "no", icon: "fa-solid fa-xmark", label: game.i18n.localize("No") }, no
					)
				],
				submit: result => resolve(result)
			});
			app.addEventListener("close", () => resolve(null), { once: true });
			this._renderChild(app);
			return promise;
		}

		/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

		/**
		 * Get render options to open an application as its own detached window.
		 * @returns {object}
		 */
		_detachOptions() {
			if ( game.release.generation < 14 ) return {};
			const { windowId } = (this.parent ?? this).window ?? {};
			return windowId ? { window: { detached: true, windowId } } : {};
		}

		/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

		/**
		 * Render an application in the same workspace as this one.
		 * @param {ApplicationV2} app - The application to render.
		 * @param {RenderOptions} [options] - Options passed to render.
		 * @returns {Promise<ApplicationV2>}
		 */
		_renderChild(app, options={}) {
			return app.render({ force: true, ...options });
			// TODO: Re-implement once everything is App V2
			// if ( this.parent ) return this.parent.renderChild(app, options);
			// return this.renderChild(app, options);
		}
	}
	return BaseApplicationV2;
}
