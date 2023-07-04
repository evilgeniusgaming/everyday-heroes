import AdvancementManager from "../advancement/advancement-manager.mjs";
import BaseActorSheet from "./base-actor-sheet.mjs";

/**
 * Sheet that represents a Hero actor.
 */
export default class HeroSheet extends BaseActorSheet {

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			tabs: [{navSelector: 'nav[data-group="primary"]', contentSelector: "main", initial: "details"}],
			width: 820,
			height: 740,
			dragDrop: [{dragSelector: ":is(.item-list .item, .primary.item)", dropSelector: null}]
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static enrichedFields = {
		...super.enrichedFields,
		notes: "system.biography.notes"
	};

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Context Preparation                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async getData(options) {
		const context = await super.getData(options);

		context.proficiencies = this.actor.system.traits.equipment.reduce((obj, key) => {
			obj[key] = true;
			return obj;
		}, {});

		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_onChangeInput(event) {
		super._onChangeInput(event);

		if ( event.target.name === "proficiency" ) {
			const category = event.target.dataset.category;
			const collection = this.actor.system.traits.equipment;
			if ( collection.has(category) ) {
				collection.delete(category);
				// TODO: Remove any categories that require this one
			} else {
				collection.add(category);
				// TODO: Add any categories that this one requires
			}
			// TODO: No need to coerce to array in V11
			return this.actor.update({"system.traits.equipment": Array.from(collection)});
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async prepareItems(context) {
		context.ammunitionTypes = {};

		const callback = (item, section) => {
			if ( ["ammunition", "explosive"].includes(item.type) ) {
				context.ammunitionTypes[item.system.type.value] ??= {};
				context.ammunitionTypes[item.system.type.value][item.id] = item;
			}
		};

		await this._prepareItemSections(context, callback);
		this._prepareItemAmmunition(context, context.inventory.weapon.items);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare type tag, skill, senses, roles, and equipment lists.
	 * @param {object} context - Context object for rendering the sheet. **Will be mutated.**
	 */
	prepareLists(context) {
		const listFormatter = new Intl.ListFormat(game.i18n.lang, {type: "conjunction", style: "short"});
		context.lists ??= {};
		context.lists.languages = listFormatter.format(context.system.traits.languages);

		// TODO: Add special movement types
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Action Handlers                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	activateListeners(jQuery) {
		super.activateListeners(jQuery);
		const html = jQuery[0];

		// Persona Action Listeners
		for ( const element of html.querySelectorAll('[data-action="persona"]') ) {
			element.addEventListener("click", this._onPersonaAction.bind(this));
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle adding & removing entries from the persona lists.
	 * @param {Event} event - Triggering click event.
	 */
	async _onPersonaAction(event) {
		event.preventDefault();
		const type = event.currentTarget.dataset.type;
		const section = event.target.closest("[data-section]")?.dataset.section;
		const collection = this.actor.system.biography[section];
		if ( !collection ) return console.warn(`Persona section ${section} not found.`);
		switch (type) {
			case "add":
				collection.push("");
				return this.actor.update({[`system.biography.${section}`]: collection});
			case "remove":
				const index = event.target.closest("[data-index]");
				collection.splice(Number(index), 1);
				return this.actor.update({[`system.biography.${section}`]: collection});
			default:
				return console.warn(`Everyday Heroes | Invalid persona action clicked ${type}.`);
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Drag & Drop                              */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async _onDropItemCreate(itemData) {
		const items = itemData instanceof Array ? itemData : [itemData];

		const toCreate = [];
		for ( const item of items ) {
			// TODO: Check to make sure items of this type are allowed on this actor
			if ( item.system.advancement?.length ) {
				const manager = AdvancementManager.forNewItem(this.actor, item);
				if ( manager.steps.length ) {
					manager.render(true);
					return false;
				}
			}
			toCreate.push(item);
		}

		return this.actor.createEmbeddedDocuments("Item", toCreate);
	}
}
