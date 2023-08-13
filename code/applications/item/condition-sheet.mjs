import { systemLog } from "../../utils.mjs";
import BaseItemSheet from "./base-item-sheet.mjs";

/**
 * Sheet that represents Condition items.
 */
export default class ConditionSheet extends BaseItemSheet {
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["everyday-heroes", "sheet", "condition", "item"],
			template: "systems/everyday-heroes/templates/item/condition-sheet.hbs",
			tabs: [],
			width: 570,
			height: "auto"
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async getData(options) {
		const context = await super.getData(options);
		context.modes = Object.entries(CONST.ACTIVE_EFFECT_MODES).reduce((obj, [key, value]) => {
			obj[value] = game.i18n.localize(`EFFECT.MODE_${key}`);
			return obj;
		}, {});
		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Action Handlers                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	activateListeners(jQuery) {
		super.activateListeners(jQuery);
		const html = jQuery[0];

		for ( const element of html.querySelectorAll('[data-action="effect"]') ) {
			element.addEventListener("click", this._onEffectAction.bind(this));
		}

		html.querySelector('[name="levels"]')?.addEventListener("change", this._onChangeLevels.bind(this));
		html.querySelector('[name="system.type.value"]').addEventListener("change", this._onChangeLevels.bind(this));
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle changes to the mode and levels.
	 * @param {Event} event - Triggering change event.
	 */
	async _onChangeLevels(event) {
		event.preventDefault();
		event.stopPropagation();

		if ( event.target.name === "levels" ) {
			await this.item.system.changeLevels(Number(event.target.value));
		} else if ( event.target.name === "system.type.value" ) {
			if ( event.target.value === "single" ) await this.item.system.changeLevels(1, event.target.value);
			else if ( this.item.system.levels.length < 2 ) await this.item.system.changeLevels(2, event.target.value);
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle actions on effects.
	 * @param {ClickEvent} event - Triggering click event.
	 * @returns {Promise}
	 */
	async _onEffectAction(event) {
		event.preventDefault();
		const { type } = event.currentTarget.dataset;
		const index = event.target.closest("[data-index]").dataset.index;
		const effect = this.item.system.levels[index].effect;
		const changesCollection = effect?.changes;
		switch (type) {
			case "add":
				changesCollection.push({key: "", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: ""});
				return await effect.update({changes: changesCollection});
			case "create":
				return await this.item.system.createEffect(parseInt(index));
			case "delete":
				const changeIndex = event.target.closest("[data-change-index]").dataset.changeIndex;
				changesCollection.splice(changeIndex, 1);
				return await effect.update({changes: changesCollection});
			default:
				return systemLog(`Invalid effect action type clicked ${type}.`, {level: "warn"});
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async _updateObject(event, formData) {
		const updates = foundry.utils.expandObject(formData);
		if ( updates.effects ) {
			const effectUpdates = Object.entries(updates.effects).map(([_id, value]) => {
				const update = { _id, ...value };
				update.changes = Object.values(update.changes);
				return update;
			});
			await this.object.updateEmbeddedDocuments("ActiveEffect", effectUpdates);
			delete updates.effects;
		}
		await this.object.update(updates);
	}
}
