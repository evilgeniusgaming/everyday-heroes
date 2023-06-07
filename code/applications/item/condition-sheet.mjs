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
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_onChangeInput(event) {
		super._onChangeInput(event);

		if ( event.target.name === "levels" ) {
			event.stopPropagation();
			this.item.system.changeLevels(Number(event.target.value));
		} else if ( event.target.name === "system.type.value" ) {
			if ( event.target.value === "single" ) {
				event.stopPropagation();
				this.item.system.changeLevels(1);
			} else if ( this.item.system.levels.length < 2 ) {
				event.stopPropagation();
				this.item.system.changeLevels(2);
			}
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
