import AdvancementFlow from "./advancement-flow.mjs";

/**
 * Inline application that presents the player with a choice of ability score improvements.
 */
export default class ASIFlow extends AdvancementFlow {

	/**
	 * Player assignments to abilities.
	 * @type {Object<string, number>}
	 */
	assignments = {};

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			template: "systems/everyday-heroes/templates/advancement/asi-flow.hbs"
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async attachRetainedData(data) {
		super.attachRetainedData(data);
		this.assignments = this.retainedData.assignments ?? {};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async getData() {
		const points = {
			assigned: Object.keys(CONFIG.EverydayHeroes.abilities).reduce((assigned, key) =>
				assigned + (this.advancement.configuration.fixed[key] ?? 0) + (this.assignments[key] ?? 0)
			, 0),
			total: this.advancement.points.total
		};
		points.available = points.total - points.assigned;

		const abilities = Object.entries(CONFIG.EverydayHeroes.abilities).reduce((obj, [key, data]) => {
			if ( this.advancement.configuration.locked.has(key) ) return obj;
			const ability = this.advancement.actor.system.abilities[key];
			const fixed = this.advancement.configuration.fixed[key] ?? 0;
			const value = Math.min(ability.value + ((fixed || this.assignments[key]) ?? 0), ability.max);
			const max = fixed ? value : Math.min(value + points.available, ability.max);
			obj[key] = {
				key: key,
				name: `abilities.${key}`,
				label: data.label,
				initial: ability.value,
				min: fixed ? max : ability.value,
				max,
				value,
				delta: (value - ability.value) ? value - ability.value : null,
				showDelta: true,
				isFixed: !!fixed,
				canIncrease: (value < max) && !fixed,
				canDecrease: (value > ability.value) && !fixed
			};
			return obj;
		}, {});

		const pluralRule = new Intl.PluralRules(game.i18n.lang).select(points.available);
		return foundry.utils.mergeObject(super.getData(), {
			abilities, points,
			pointsRemaining: game.i18n.format(
				`EH.Advancement.ASI.Points.Remaining[${pluralRule}]`, {points: points.available}
			)
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	activateListeners(jQuery) {
		super.activateListeners(jQuery);
		const html = jQuery[0];
		for ( const button of html.querySelectorAll("[data-action]") ) {
			button.addEventListener("click", this._onClickButton.bind(this));
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_onChangeInput(event) {
		super._onChangeInput(event);
		const input = event.currentTarget;
		const key = input.closest("[data-score]").dataset.score;
		const clampedValue = Math.clamped(Number(input.min), input.valueAsNumber, Number(input.max));
		this.assignments[key] = clampedValue - Number(input.dataset.initial);
		this.render();
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle clicking the plus and minus buttons.
	 * @param {Event} event - Triggering click event.
	 */
	_onClickButton(event) {
		event.preventDefault();
		const action = event.currentTarget.dataset.action;
		const key = event.currentTarget.closest("li").dataset.score;

		this.assignments[key] ??= 0;
		if ( action === "decrease" ) this.assignments[key] -= 1;
		else if ( action === "increase" ) this.assignments[key] += 1;
		else return;

		this.render();
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async _updateObject(event, formData) {
		await this.advancement.apply(this.level, { assignments: this.assignments });
	}
}
