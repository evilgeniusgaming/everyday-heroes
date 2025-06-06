import { numberFormat } from "../../utils.mjs";
import AdvancementFlow from "./advancement-flow.mjs";

/**
 * Inline application that allows for various methods of assigning ability scores.
 */
export default class AbilityScoresFlow extends AdvancementFlow {

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			template: "systems/everyday-heroes/templates/advancement/ability-scores-flow.hbs"
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Abilities that can be assigned.
	 * @type {[string, object][]}
	 */
	get abilities() {
		return Object.entries(CONFIG.EverydayHeroes.abilities).filter(([, c]) => c.assignment);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Scores assigned to specific abilities.
	 * @type {Record<string, number>}
	 */
	assignments;

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Selected assignment method.
	 * @type {string}
	 */
	method;

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Rolls that have been performed.
	 * @type {Roll[]}
	 */
	rolls;

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async attachRetainedData(data) {
		super.attachRetainedData(data);
		this.method = this.retainedData?.method;
		this.rolls = this.retainedData?.rolls ?? [];
		this.assignments = this.retainedData?.assignments ?? {};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Rendering                                */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	getData() {
		const context = foundry.utils.mergeObject(super.getData(), {
			method: this.method,
			selectedSet: new Set(Object.values(this.assignments ?? {}))
		});
		switch (this.method) {
			case "rolling":
				this.getRollingContext(context);
				break;
			case "pointBuy":
				this.getPointBuyContext(context);
				break;
			case "startingArray":
				this.getStandardArrayContext(context);
				break;
		}
		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare context data for rolling method.
	 * @param {object} context - Context being prepared.
	 */
	getRollingContext(context) {
		context.rolls = this.advancement.configuration.rolling.map((rollConfig, index) => ({
			index,
			formula: this.advancement.buildRollFormula(rollConfig),
			roll: this.rolls[index]
		}));
		const sortedRolls = Array.from(context.rolls)
			.sort((lhs, rhs) => (rhs.roll?.total ?? -Infinity) - (lhs.roll?.total ?? -Infinity));
		context.scores = this.abilities.map(([key, { label }]) => ({
			key,
			label,
			value: this.assignments[key],
			potentialValues: sortedRolls.map(({ roll, index }) => ({
				index,
				number: roll ? numberFormat(roll.total) : "—",
				selected: this.assignments[key] === index,
				dimmed: (this.assignments[key] !== index) && context.selectedSet.has(index)
			}))
		}));
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare context data for point buy method.
	 * @param {object} context - Context being prepared.
	 */
	getPointBuyContext(context) {
		const costs = CONFIG.EverydayHeroes.abilityScoreAssignment.pointBuyCosts;
		const sortedKeys = Object.keys(costs).map(k => Number(k)).sort((lhs, rhs) => lhs - rhs);
		const minScore = sortedKeys.shift();
		const maxScore = Math.min(Number(sortedKeys.pop()), this.advancement.configuration.pointBuy.maximum);
		const pluralRules = new Intl.PluralRules(game.i18n.lang);

		context.points = {
			max: this.advancement.configuration.pointBuy.points,
			spent: Object.values(this.assignments).reduce((t, s) => t + (costs[s] ?? 0), 0)
		};
		context.points.remaining = context.points.max - context.points.spent;
		context.points.remainingLabel = game.i18n.format("EH.Advancement.AbilityScores.PointBuy.Remaining", {
			remaining: context.points.remaining,
			total: context.points.max
		});
		context.points.list = Array.fromRange(context.points.max).map(number => ({
			number: number + 1,
			spent: number >= context.points.remaining
		}));
		context.scores = this.abilities.map(([key, { label }]) => {
			const score = this.assignments[key] ?? minScore;
			const data = {
				key,
				label,
				score,
				steps: score - minScore,
				isMin: score <= minScore,
				isMax: score >= maxScore,
				existingCost: costs[score] ?? 0
			};
			data.nextCost = !data.isMax ? costs[score + 1] - data.existingCost : null;
			data.nextCostTooltip = game.i18n.format(
				`EH.Advancement.AbilityScores.PointBuy.Points.Count[${pluralRules.select(data.nextCost)}]`,
				{ number: data.nextCost }
			);
			data.previousCost = !data.isMin ? data.existingCost - costs[score - 1] : null;
			data.previousCostTooltip = game.i18n.format(
				`EH.Advancement.AbilityScores.PointBuy.Points.Count[${pluralRules.select(data.previousCost)}]`,
				{ number: data.previousCost }
			);
			data.canAfford = data.nextCost !== null && data.nextCost <= context.points.remaining;
			return data;
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare context data for standard array method.
	 * @param {object} context - Context being prepared.
	 */
	getStandardArrayContext(context) {
		context.scores = this.abilities.map(([key, { label }]) => ({
			key,
			label,
			value: this.assignments[key],
			potentialValues: this.advancement.configuration.startingArray.map((number, index) => ({
				index,
				number: numberFormat(number),
				selected: this.assignments[key] === index,
				dimmed: (this.assignments[key] !== index) && context.selectedSet.has(index)
			}))
		}));
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Event Listeners & Handlers               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	activateListeners(jQuery) {
		super.activateListeners(jQuery);
		const [html] = jQuery;

		for ( const element of html.querySelectorAll("[data-method]") ) {
			element.addEventListener("click", event => {
				this.method = event.target.dataset.method;
				this.assignments = {};
				this.rolls = [];
				this.render();
			});
		}

		for ( const element of html.querySelectorAll('[name^="assignments."]') ) {
			element.addEventListener("change", this._onAssignmentChoice.bind(this));
		}

		for (const element of html.querySelectorAll("[data-points]:not([disabled])")) {
			element.addEventListener("click", this._onPointBuyAction.bind(this));
		}

		for ( const element of html.querySelectorAll("[data-formula]") ) {
			element.addEventListener("click", this._onRollScore.bind(this));
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle assigning a value to an ability score in rolling & starting array methods.
	 * @param {Event} event - Triggering change event.
	 */
	_onAssignmentChoice(event) {
		const form = event.target.closest("form");
		const key = event.target.closest("[data-key]").dataset.key;
		const value = Number(event.currentTarget.value);
		this.assignments[key] = value;

		// Set dimmed state
		for ( const index of Array.fromRange(this.advancement.configuration.startingArray.length) ) {
			const anyChecked = !!form.querySelector(`[value="${index}"]:checked`);
			for ( const element of form.querySelectorAll(`[value="${index}"]`) ) {
				element.classList.toggle("dimmed", !element.checked && anyChecked);
			}
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle increasing or decreasing the point buy scores.
	 * @param {PointerEvent} event - Triggering click event.
	 */
	_onPointBuyAction(event) {
		const action = event.currentTarget.dataset.points;
		const section = event.target.closest("[data-key]");
		const key = section.dataset.key;
		const currentValue = Number(section.dataset.score);
		this.assignments[key] = currentValue + (action === "buy" ? 1 : -1);
		this.render();
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle rolling an ability score value.
	 * @param {PointerEvent} event - Triggering click event.
	 */
	async _onRollScore(event) {
		const roll = new Roll(event.currentTarget.dataset.formula);
		await roll.evaluate();

		// Create chat message with roll results
		const cls = getDocumentClass("ChatMessage");
		const flavor = game.i18n.localize("EH.Advancement.AbilityScores.Rolling.Flavor");
		const messageData = {
			flavor,
			title: `${flavor}: ${this.advancement.actor.name}`,
			speaker: cls.getSpeaker({ actor: this.advancement.actor }),
			user: game.user.id,
			sound: CONFIG.sounds.dice,
			rolls: [roll],
			"flags.everyday-heroes.type": "abilityScore"
		};
		const message = new cls(messageData);
		await cls.create(message.toObject(), { rollMode: game.settings.get("core", "rollMode") });

		// Save roll
		const index = event.target.closest("[data-index]").dataset.index;
		while (this.rolls.length < index) this.rolls.push(null);
		this.rolls[index] = roll;
		this.render();
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async _updateObject(event, formData) {
		await this.advancement.apply(this.level, {
			method: this.method,
			rolls: this.rolls,
			assignments: this.assignments
		});
	}
}

