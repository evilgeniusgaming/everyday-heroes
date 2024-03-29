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
		const conf = this.advancement.configuration;
		const points = {
			assigned: this.assignments.size,
			available: conf.points - this.assignments.size,
			total: conf.points
		};

		const traits = {};
		for ( const [key, config] of Object.entries(this.advancement.options ?? {}) ) {
			if ( conf.choices.size && !conf.choices.has(key) && !conf.fixed.has(key) ) continue;
			const canApply = this.advancement.canApply(key, this.advancement.actor.system);
			const ability = this.advancement.actor.system.abilities[key];
			const checked = this.assignments.has(key) || (conf.fixed.has(key) && canApply);
			traits[key] = {
				label: conf.type !== "asi" ? config.label
					: `${config.label}: ${numberFormat(ability.value + (checked ? 1 : 0))}`,
				checked,
				disabled: !canApply || conf.fixed.has(key) || (!checked && !points.available)
			};
		}

		const pluralRule = new Intl.PluralRules(game.i18n.lang).select(points.available);
		return foundry.utils.mergeObject(super.getData(), {
			assignments: this.assignments,
			traits: this.advancement.options ? traits : null,
			traitConfig: this.advancement.constructor.traits[conf.type],
			pointsRemaining: game.i18n.format(
				`EH.Advancement.Trait.Points.Remaining[${pluralRule}]`, {points: points.available}
			)
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Action Handlers                          */
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
