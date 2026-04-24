import AdoptedStyleSheetMixin from "./adopted-stylesheet-mixin.mjs";
import PropertyElement from "./property.mjs";

const { AbstractFormInputElement } = foundry.applications.elements;

/**
 * Custom HTML element for handling property cycling.
 * @fires change
 */
export default class PropertyModificationElement extends AdoptedStyleSheetMixin(AbstractFormInputElement) {
	/** @inheritDoc */
	constructor() {
		super();
		this._internals.ariaValueMin = -1;
		this._internals.ariaValueMax = 1;
		this._internals.ariaValueStep = 1;
		this._internals.role = "spinbutton";
		this.#shadowRoot = this.attachShadow({ mode: "open" });
		this._adoptStyleSheet(this._getStyleSheet());
		this._value = Number(this.getAttribute("value") ?? 0);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * The HTML tag named used by this element.
	 * @type {string}
	 */
	static tagName = "eh-property-modification";

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @inheritDoc */
	static CSS = PropertyElement.CSS;

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Controller for removing listeners automatically.
	 * @type {AbortController}
	 */
	#controller;

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

	/** @inheritDoc */
	_setValue(value) {
		console.log("_setValue", value);
		if ( ![-1, 0, 1].includes(value) ) throw new Error("Value must be a valid property modification value.");
		return super._setValue(value);
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
		input.setAttribute("type", "number");
		if ( this.disabled ) input.setAttribute("disabled", "");
		div.appendChild(input);

		return [];
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @override */
	_refresh() {
		const input = this.#shadowRoot.querySelector("input");
		input.setAttribute("value", this._value);
		this._internals.ariaValueNow = this._value;
		// TODO: Set text description
		// this._internals.ariaValueText = CONFIG.DND5E.proficiencyLevels[this._value];
		this._internals.setFormValue(this._value);
		this._primaryInput = this.#shadowRoot.querySelector("input");
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @override */
	_activateListeners() {
		const { signal } = this.#controller = new AbortController();
		this.addEventListener("click", this.#onClick.bind(this), { signal });
		this.addEventListener("contextmenu", this.#onClick.bind(this), { signal });
		this.#shadowRoot.querySelector("div").addEventListener("contextmenu", e => e.preventDefault(), { signal });
		this.#shadowRoot.querySelector("input").addEventListener("change", this.#onChangeInput.bind(this), { signal });
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
	 * Change the value by one step, looping around if the limits have been reached.
	 * @param {boolean} [up=true]  Should the value step up or down?
	 */
	step(up=true) {
		const levels = [-1, 0, 1];
		const idx = levels.indexOf(this.value);
		this.value = levels[(idx + (up ? 1 : levels.length - 1)) % levels.length];
		this.dispatchEvent(new Event("change"));
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle changes to the input value directly.
	 * @param {Event} event  Triggering change event.
	 */
	#onChangeInput(event) {
		this.step(event.target.valueAsNumber > this.value);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle a click event for modifying the value.
	 * @param {PointerEvent} event  Triggering click event.
	 */
	#onClick(event) {
		event.preventDefault();
		if ( this.disabled ) return;
		this.step((event.type === "click") && (event.button !== 2));
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static {
		window.customElements.define(this.tagName, this);
	}
}
