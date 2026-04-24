import AdoptedStyleSheetMixin from "./adopted-stylesheet-mixin.mjs";

const { AbstractFormInputElement } = foundry.applications.elements;

/**
 * Custom HTML element for handling property toggling.
 * @fires change
 */
export default class PropertyElement extends AdoptedStyleSheetMixin(AbstractFormInputElement) {
	/** @inheritDoc */
	constructor() {
		super();
		this._internals.role = "checkbox";
		this.#shadowRoot = this.attachShadow({ mode: "open" });
		this._adoptStyleSheet(this._getStyleSheet());
		this._value = this.getAttribute("value");
		this.#defaultValue = this._value;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * The HTML tag named used by this element.
	 * @type {string}
	 */
	static tagName = "eh-property";

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @inheritDoc */
	static CSS = `
		div {
			flex: 0 0 var(--eh-property-size, 20px);
			block-size: var(--eh-property-size, 20px);
			inline-size: var(--eh-property-size, 20px);
			background-color: var(--eh-background-color-white);
			border: 1px solid var(--eh-border-color-strong);
			border-radius: 50%;
			position: relative;

			&::after {
				align-items: center;
				color: var(--eh-text-color-black);
				content: "";
				display: flex;
				font-size: var(--font-size-24);
				font-weight: bold;
				inset: 0;
				justify-content: center;
				position: absolute;
			}
			&:not(:disabled) {
				cursor: var(--cursor-pointer);

				&:has(input:checked, input[value="1"]) { background-color: var(--eh-input-color-add); }
				&:has(input[value="-1"]) { background-color: var(--eh-input-color-remove); }
			}
			&:disabled {
				background-color: var(--eh-input-color-disabled);

				&:has(input:checked, input[value="1"]) { background-color: var(--eh-input-color-disabled-checked); }
			}
			&:has(input[value="1"])::after { content: "+"; }
			&:has(input[value="-1"])::after { content: "-"; }

			input {
				background: none;
				border: none;
				height: 1px;
				inset: 50%;
				position: absolute;
				width: 1px;
				z-index: -1;
			}
		}
	`;

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * The checked state of the checkbox.
	 * @type {boolean}
	 */
	get checked() {
		return this.hasAttribute("checked");
	}

	set checked(checked) {
		this.toggleAttribute("checked", checked);
		this._refresh();
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Controller for removing listeners automatically.
	 * @type {AbortController}
	 */
	#controller;

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * The default value as originally specified in the HTML that created this object.
	 * @type {string}
	 */
	get defaultValue() {
		return this.#defaultValue;
	}

	#defaultValue;

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * The indeterminate state of the checkbox.
	 * @type {boolean}
	 */
	get indeterminate() {
		return this.hasAttribute("indeterminate");
	}

	set indeterminate(indeterminate) {
		this.toggleAttribute("indeterminate", indeterminate);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Shadow root of the element.
	 * @type {ShadowRoot}
	 */
	#shadowRoot;

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @override */
	_toggleDisabled(value) {
		this.#shadowRoot.querySelector("input")?.toggleAttribute("disabled", value);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @override */
	get value() {
		return super.value;
	}

	/**
	 * Override AbstractFormInputElement#value setter because we want to emit input/change events when the checked state
	 * changes, and not when the value changes.
	 * @override
	 */
	set value(value) {
		this._setValue(value);
	}

	/** @override */
	_getValue() {
		// Workaround for FormElementExtended only checking the value property and not the checked property.
		if ( typeof this._value === "string" ) return this._value;
		return this.checked;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Methods                                  */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @inheritDoc */
	_adoptStyleSheet(sheet) {
		this.#shadowRoot.adoptedStyleSheets = [sheet];
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @override */
	_buildElements() {
		const div = document.createElement("div");
		this.#shadowRoot.replaceChildren(div);

		const input = document.createElement("input");
		input.setAttribute("type", "checkbox");
		if ( this.disabled ) input.setAttribute("disabled", "");
		div.appendChild(input);

		return [];
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @override */
	_refresh() {
		const input = this.#shadowRoot.querySelector("input");
		input.checked = this.checked;
		this._internals.setFormValue(this._value);
		this._primaryInput = this.#shadowRoot.querySelector("input");
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @override */
	_activateListeners() {
		const { signal } = this.#controller = new AbortController();
		this.addEventListener("click", this.#onClick.bind(this), { signal });
		this.addEventListener("keydown", event => event.key === " " ? this.#onClick(event) : null, { signal });
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @override */
	disconnectedCallback() {
		this.#controller.abort();
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Redirect focus requests into the inner input.
	 * @param {object} options  Focus options forwarded to inner input.
	 */
	focus(options) {
		this.#shadowRoot.querySelector("input")?.focus(options);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle a click event for modifying the value.
	 * @param {PointerEvent} event  Triggering click event.
	 */
	#onClick(event) {
		event.preventDefault();
		this.checked = !this.checked;
		this.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
		this.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static {
		window.customElements.define(this.tagName, this);
	}
}
