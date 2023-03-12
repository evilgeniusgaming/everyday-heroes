import AdvancementConfig from "./advancement-config.mjs";

/**
 * Configuration application for ability score improvements.
 */
export default class ASIConfig extends AdvancementConfig {

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["everyday-heroes", "advancement", "config", "asi"],
			template: "systems/everyday-heroes/templates/advancement/asi-config.hbs"
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	getData() {
		const abilities = Object.entries(CONFIG.EverydayHeroes.abilities).reduce((obj, [key, data]) => {
			const fixed = this.advancement.configuration.fixed[key] ?? 0;
			obj[key] = {
				key: key,
				name: `configuration.fixed.${key}`,
				label: data.label,
				value: fixed,
				canIncrease: true,
				canDecrease: true,
				showLocked: true,
				isLocked: this.advancement.configuration.locked.has(key) || (fixed > 0)
			};
			return obj;
		}, {});

		return foundry.utils.mergeObject(super.getData(), {
			abilities,
			points: {
				key: "points",
				name: "configuration.points",
				label: game.i18n.localize("EH.Advancement.ASI.Points.Label"),
				min: 0,
				value: this.advancement.configuration.points,
				canIncrease: true,
				canDecrease: this.advancement.configuration.points > 0
			}
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

	/**
	 * Handle clicking the plus, minus, or lock buttons.
	 * @param {Event} event - Triggering click event.
	 */
	_onClickButton(event) {
		event.preventDefault();
		const action = event.currentTarget.dataset.action;
		const score = event.currentTarget.closest("[data-score]");
		const input = score.querySelector("input");

		if ( action === "decrease" ) input.valueAsNumber -= 1;
		else if ( action === "increase" ) input.valueAsNumber += 1;
		else if ( action === "lock" ) {
			const lockedCollection = this.advancement.configuration.locked;
			if ( lockedCollection.has(score.dataset.score) ) lockedCollection.delete(score.dataset.score);
			else lockedCollection.add(score.dataset.score);
			// TODO: No need to coerce this into an array after V11
			this.advancement.update({"configuration.locked": Array.from(lockedCollection)});
			return;
		}

		this.submit();
	}
}
