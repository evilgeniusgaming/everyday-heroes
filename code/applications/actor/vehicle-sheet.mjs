import ActorEH from "../../documents/actor.mjs";
import { simplifyBonus } from "../../utils.mjs";
import BaseActorSheet from "./base-actor-sheet.mjs";

/**
 * Sheet that represents a Vehicle actor.
 */
export default class VehicleSheet extends BaseActorSheet {

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			tabs: [{navSelector: 'nav[data-group="primary"]', contentSelector: "main", initial: "details"}],
			width: 580,
			height: 620,
			dragDrop: [{dragSelector: ".item-list .item", dropSelector: "form"}]
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Context Preparation                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async getData(options) {
		const context = await super.getData(options);

		this.preparePeople(context);
		this.prepareRolls(context);

		context.sizes = CONFIG.EverydayHeroes.vehicleSizes.reduce((obj, k) => {
			obj[k] = CONFIG.EverydayHeroes.sizes[k];
			return obj;
		}, {});

		context.speedCategories = {};
		let currentCategoryFound = false;
		for ( const [key, category] of Object.entries(CONFIG.EverydayHeroes.vehicleSpeedCategories) ) {
			if ( key === "airspeed" && !this.actor.system.traits.properties.has("airspeed") ) continue;
			const c = context.speedCategories[key] = {
				...category,
				current: key === this.actor.system.attributes.speed.category
			};
			c.cssClass = currentCategoryFound ? "" : c.current ? "current" : "exceeded";
			if ( c.current ) currentCategoryFound = true;
		}

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
	 * Prepare driver and list of passengers.
	 * @param {object} context - Context object for rendering the sheet. **Will be mutated.**
	 */
	preparePeople(context) {
		context.people = {
			driver: {
				label: game.i18n.localize("EH.Vehicle.People.Driver[one]"),
				type: game.i18n.localize("EH.Vehicle.People.Driver[one]"),
				actors: []
			},
			passengers: {
				label: game.i18n.localize("EH.Vehicle.People.Passenger[other]"),
				type: game.i18n.localize("EH.Vehicle.People.Passenger[one]"),
				actors: []
			}
		};
		context.personContext = {};
		for ( const person of Object.values(context.actor.system.people).sort((lhs, rhs) => lhs.sort - rhs.sort) ) {
			const actor = person.actor;
			if ( !actor ) continue;
			const ctx = context.personContext[actor.id] ??= {};
			ctx.isDriver = actor === context.actor.system.details.driver;
			context.people[ctx.isDriver ? "driver" : "passengers"].actors.push(actor);
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare the list of rolls this vehicle can take.
	 * @param {object} context - Context object for rendering the sheet. **Will be mutated.**
	 */
	prepareRolls(context) {
		context.rolls = {};
		const system = context.system;
		const modFormatter = new Intl.NumberFormat(game.i18n.lang, { signDisplay: "always" });
		const driverSkill = system.driverSkill;
		const rollData = context.actor.getRollData({ determinsitic: true });
		for ( const [key, roll] of Object.entries(CONFIG.EverydayHeroes.vehicleRolls) ) {
			switch (roll.type) {
				case "vehicle-check":
					const ability = system.abilities[roll.ability];
					let mod = driverSkill?.mod ?? 0;
					if ( roll.mode === "add" ) mod += ability?.mod ?? 0;
					else if ( roll.mode === "max" ) mod = Math.min(mod, ability.mod ?? 0);
					mod += simplifyBonus(ability.bonuses?.check ?? "", rollData);
					mod += simplifyBonus(system.details.driver?.system.vehicle?.bonuses.roll[key] ?? "", rollData);
					mod += simplifyBonus(system.bonuses.roll[key] ?? "", rollData);
					context.rolls[key] = { ...roll, disabled: !driverSkill, mod: modFormatter.format(mod) };
					break;
				case "vehicle-damage":
					const speed = CONFIG.EverydayHeroes.vehicleSpeedCategories[this.actor.system.attributes.speed.category];
					const formula = speed?.damage?.[roll.mode];
					context.rolls[key] = {
						...roll,
						disabled: !formula,
						mod: game.i18n.localize(formula)
					};
					break;
				case "vehicle-save":
					break;
			}
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Action Handlers                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	activateListeners(jQuery) {
		super.activateListeners(jQuery);
		const html = jQuery[0];

		// Person Action Listeners
		for ( const element of html.querySelectorAll('[data-action="person"]') ) {
			element.addEventListener("click", this._onPersonAction.bind(this));
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle one of the person actions.
	 * @param {ClickEvent} event - Triggering click event.
	 * @returns {Promise}
	 */
	async _onPersonAction(event) {
		event.preventDefault();
		const container = event.currentTarget.closest("[data-actor-id]");
		const id = container?.dataset.actorId;
		const actor = id ? this.actor.system.people[id]?.actor : null;
		if ( !actor ) return;
		const { type } = event.currentTarget.dataset;
		switch (type) {
			case "exit":
				return this.actor.system.removePerson(actor);
			case "makeDriver":
				await this.actor.update({"system.details.driver": actor.id});
				return actor?.reset();
			case "makePassenger":
				if ( actor !== this.actor.system.details.driver ) return;
				await this.actor.update({"system.details.driver": null});
				return actor?.reset();
			case "view":
				return actor?.sheet.render(true);
			default:
				return console.warn(`Everyday Heroes | Invalid person action type clicked ${type}.`);
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Drag & Drop                              */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_onDragStart(event) {
		if ( event.target.classList.contains("content-link") ) return;
		const actorId = event.currentTarget.dataset.actorId;
		if ( !actorId ) return super._onDragStart(event);
		const actor = this.actor.system.people[actorId].actor;
		if ( !actor ) return;
		event.dataTransfer.setData("text/plain", JSON.stringify(actor.toDragData()));
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async _onDropActor(event, data) {
		if ( !this.isEditable ) return;
		const actor = await ActorEH.fromDropData(data);
		if ( !actor ) return;

		const closestSection = event.target.closest("[data-section-id]");
		const driverDrop = (closestSection?.dataset.sectionId === "driver")
			|| (event.target.closest("[data-tab]").dataset.tab === "details");

		// Add actor to people if not already in vehicle
		if ( !this.actor.system.people[actor.id] ) {
			try {
				return await this.actor.system.addPerson(actor, { driver: driverDrop });
			} catch(err) {
				return ui.notifications.error(err.message);
			}
		}

		const isDriver = this.actor.system.details.driver === actor;

		// If passenger dropped on driver section or on the details tab, make this actor the driver
		if ( driverDrop && !isDriver ) {
			await this.actor.update({"system.details.driver": actor.id});
			return actor.reset();
		}

		// If driver dropped into passengers section, remove from driver's seat
		if ( (closestSection?.dataset.sectionId === "passengers") && isDriver ) {
			await this.actor.update({"system.details.driver": null});
			return actor.reset();
		}

		// If dropped on the passengers section, sort relative to other actors
		if ( closestSection?.dataset.sectionId === "passengers" ) {
			return this._onSortActor(event, actor);
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle sorting passengers relative to one another.
	 * @param {DropEvent} event - Drop event.
	 * @param {Actor} actor - The actor being dropped.
	 */
	_onSortActor(event, actor) {
		const source = this.actor.system.people[actor.id];
		const target = this.actor.system.people[event.target.closest("[data-actor-id]")?.dataset.actorId];
		if ( !target?.actor || (source.actor.id === target.actor.id) ) return;
		const siblings = Object.values(this.actor.system.people).filter(s => s.actor?.id !== source.actor.id);

		// Perform the sort
		const sortUpdates = SortingHelpers.performIntegerSort(source, {target, siblings});
		const updates = sortUpdates.reduce((updates, u) => {
			if ( u.target.actor ) updates[`system.people.${u.target.actor.id}.sort`] = u.update.sort;
			return updates;
		}, {});

		this.actor.update(updates);
	}

}
