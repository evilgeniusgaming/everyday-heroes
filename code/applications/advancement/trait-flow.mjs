import { numberFormat } from "../../utils.mjs";
import AdvancementFlow from "./advancement-flow.mjs";

/**
 * Inline application that presents the player with a choice of proficiencies or ability score improvements.
 */
export default class TraitFlow extends AdvancementFlow {

	/**
	 * Player assignments to proficiencies.
	 * @type {Set<string>}
	 */
	assignments = new Set();

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			template: "systems/everyday-heroes/templates/advancement/trait-flow.hbs"
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async attachRetainedData(data) {
		super.attachRetainedData(data);
		this.assignments = this.retainedData.assignments ?? new Set();
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async getData() {
		const points = {
			assigned: this.assignments.size,
			available: this.advancement.configuration.points - this.assignments.size,
			total: this.advancement.configuration.points
		};

		const traits = {};
		for ( const [key, config] of Object.entries(this.advancement.options ?? {}) ) {
			if ( !this.advancement.configuration.fixed.has(key)
				&& !this.advancement.configuration.choices.has(key) ) continue;
			const canApply = this.advancement.canApply(key, this.advancement.actor.system);
			const ability = this.advancement.actor.system.abilities[key];
			const checked = this.assignments.has(key) || (this.advancement.configuration.fixed.has(key) && canApply);
			traits[key] = {
				label: this.advancement.configuration.type !== "asi" ? config.label
					: `${config.label}: ${numberFormat(ability.value + (checked ? 1 : 0))}`,
				checked,
				disabled: !canApply || this.advancement.configuration.fixed.has(key) || (!checked && !points.available)
			};
		}

		const pluralRule = new Intl.PluralRules(game.i18n.lang).select(points.available);
		return foundry.utils.mergeObject(super.getData(), {
			assignments: this.assignments,
			traits: this.advancement.options ? traits : null,
			traitConfig: this.advancement.constructor.traits[this.advancement.configuration.type],
			pointsRemaining: game.i18n.format(
				`EH.Advancement.Trait.Points.Remaining[${pluralRule}]`, {points: points.available}
			)
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Action Handlers                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	activateListeners(jQuery) {
		super.activateListeners(jQuery);
		const html = jQuery[0];

		for ( const element of html.querySelectorAll(".tag-input input") ) {
			element.addEventListener("change", this._onTagInputAction.bind(this, "add"));
		}
		for ( const element of html.querySelectorAll('.tag-input [data-action="delete"]') ) {
			element.addEventListener("click", this._onTagInputAction.bind(this, "delete"));
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_onChangeInput(event) {
		super._onChangeInput(event);
		const input = event.currentTarget;
		const key = input.name.replace("assignments.", "");
		if ( input.checked ) this.assignments.add(key);
		else this.assignments.delete(key);
		this.render();
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle actions associated with tag inputs.
	 * @param {string} type - Action type being handled.
	 * @param {ClickEvent} event - Triggering click event.
	 * @returns {Promise}
	 */
	async _onTagInputAction(type, event) {
		event.preventDefault();
		const tagInput = event.target.closest(".tag-input");
		if ( !tagInput ) return;
		const shouldValidate = tagInput.dataset.validate;

		switch (type) {
			case "add":
				const validOptions = Array.from(event.target.list?.options ?? []).map(o => o.value);
				if ( shouldValidate && !validOptions.includes(event.target.value) ) return;
				this.assignments.add(event.target.value);
				break;
			case "delete":
				const key = event.target.closest("[data-key]")?.dataset.key;
				this.assignments.delete(key);
				break;
			default:
				return console.warn(`Invalid tag action type ${type}`);
		}
		this.render();
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async _updateObject(event, formData) {
		await this.advancement.apply(this.level, { assignments: this.assignments });
	}
}
