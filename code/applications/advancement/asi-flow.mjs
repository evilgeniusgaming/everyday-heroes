import { numberFormat } from "../../utils.mjs";
import AdvancementFlow from "./advancement-flow.mjs";

/**
 * Inline application that presents the player with a choice of ability score improvements.
 */
export default class ASIFlow extends AdvancementFlow {

	/**
	 * Player assignments to abilities.
	 * @type {Set<string>}
	 */
	assignments = new Set();

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			template: "systems/everyday-heroes/templates/advancement/asi-flow.hbs"
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
			available: this.advancement.points.total - this.assignments.size,
			total: this.advancement.points.total
		};

		const abilities = {};
		for ( const [key, config] of Object.entries(CONFIG.EverydayHeroes.abilities) ) {
			if ( !this.advancement.configuration.fixed.has(key)
				&& !this.advancement.configuration.choices.has(key) ) continue;
			const ability = this.item.actor.system.abilities[key];
			const maxed = ability.value >= ability.max;
			const checked = this.assignments.has(key) || (this.advancement.configuration.fixed.has(key) && !maxed);
			abilities[key] = {
				label: `${config.label}: ${numberFormat(ability.value + (checked ? 1 : 0))}`,
				checked,
				disabled: this.advancement.configuration.fixed.has(key) || (!checked && (!points.available || maxed))
			};
		}

		const pluralRule = new Intl.PluralRules(game.i18n.lang).select(points.available);
		return foundry.utils.mergeObject(super.getData(), {
			abilities,
			pointsRemaining: game.i18n.format(
				`EH.Advancement.ASI.Points.Remaining[${pluralRule}]`, {points: points.available}
			)
		});
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

	async _updateObject(event, formData) {
		await this.advancement.apply(this.level, { assignments: this.assignments });
	}
}
