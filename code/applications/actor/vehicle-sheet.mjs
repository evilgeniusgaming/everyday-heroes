import BaseActorSheet from "./base-actor-sheet.mjs";

/**
 * Sheet that represents a Vehicle actor.
 */
export default class VehicleSheet extends BaseActorSheet {

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			tabs: [{navSelector: 'nav[data-group="primary"]', contentSelector: "main", initial: "details"}],
			width: 580,
			height: 580,
			dragDrop: [{dragSelector: ":is(.item-list .item, .primary.item)", dropSelector: null}]
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Context Preparation                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async getData(options) {
		const context = await super.getData(options);

		context.people = {
			driver: {
				label: "Driver"
			},
			passengers: {
				label: "Passengers"
			}
		};

		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async prepareItems(context) {
		const ammunitionTypes = {};

		const callback = (item, section) => {
			if ( ["ammunition", "explosive"].includes(item.type) ) {
				ammunitionTypes[item.system.type.value] ??= {};
				ammunitionTypes[item.system.type.value][item.id] = item;
			}
		};

		await this._prepareItemSections(context, callback);
		this._prepareItemAmmunition(context, context.contents.weapon.items);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare type tag, skill, senses, roles, and equipment lists.
	 * @param {object} context - Context object for rendering the sheet. **Will be mutated.**
	 */
	prepareLists(context) {

	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Action Handlers                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	activateListeners(jQuery) {
		super.activateListeners(jQuery);
		const html = jQuery[0];
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Drag & Drop                              */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

}
