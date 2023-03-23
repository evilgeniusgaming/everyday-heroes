import { AdvancementCollection } from "../../data/fields/advancement-field.mjs";
import Advancement from "../../documents/advancement/advancement.mjs";

/**
 * Internal type used to manage each step within the advancement process.
 *
 * @typedef {object} AdvancementStep
 * @property {string} type - Step type from "forward", "reverse", "restore", or "delete".
 * @property {AdvancementFlow} [flow] - Flow object for the advancement being applied by this step.
 * @property {ItemEH} [item] - For "delete" steps only, the item to be removed.
 * @property {boolean} [automatic=false] - Should the manager attempt to apply this step without user interaction?
 */

/**
 * Application for controlling the advancement workflow and displaying the interface.
 *
 * @param {ActorEH} actor - Actor on which this advancement is being performed.
 * @param {object} [options={}] - Additional application options.
 *
 * @copyright Adapted from the [dnd5e system]{@link https://github.com/foundryvtt/dnd5e}
 */
export default class AdvancementManager extends Application {
	constructor(actor, options={}) {
		super(options);
		this.actor = actor;
		this.clone = actor.clone();
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * The original actor to which changes will be applied when the process is complete.
	 * @type {ActorEH}
	 */
	actor;

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * A clone of the original actor to which the changes can be applied during the advancement process.
	 * @type {ActorEH}
	 */
	clone;

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Individual steps that will be applied in order.
	 * @type {object}
	 */
	steps = [];

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Step being currently displayed.
	 * @type {number|null}
	 * @private
	 */
	#stepIndex = null;

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Is the prompt currently advancing through un-rendered steps?
	 * @type {boolean}
	 * @private
	 */
	#advancing = false;

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["everyday-heroes", "advancement", "manager"],
			template: "systems/everyday-heroes/templates/advancement/advancement-manager.hbs",
			width: 460,
			height: "auto"
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get title() {
		const visibleSteps = this.steps.filter(s => !s.automatic);
		const visibleIndex = visibleSteps.indexOf(this.step);
		const numberFormatter = new Intl.NumberFormat(game.i18n.lang);
		const step = visibleIndex < 0 ? "" : game.i18n.format("EH.Advancement.Manager.Steps", {
			current: numberFormatter.format(visibleIndex + 1),
			total: numberFormatter.format(visibleSteps.length)
		});
		return `${game.i18n.localize("EH.Advancement.Manager.Title")} ${step}`;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get id() {
		return `actor-${this.actor.id}-advancement`;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Get the step that is currently in progress.
	 * @type {object|null}
	 */
	get step() {
		return this.steps[this.#stepIndex] ?? null;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Get the step before the current one.
	 * @type {object|null}
	 */
	get previousStep() {
		return this.steps[this.#stepIndex - 1] ?? null;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Get the step after the current one.
	 * @type {object|null}
	 */
	get nextStep() {
		const nextIndex = this.#stepIndex === null ? 0 : this.#stepIndex + 1;
		return this.steps[nextIndex] ?? null;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Factory Methods                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Construct a manager for a newly added advancement from drag-drop.
	 * @param {ActorEH} actor - Actor from which the advancement should be updated.
	 * @param {string} itemId - ID of the item to which the advancements are being dropped.
	 * @param {Advancement[]} advancements - Dropped advancements to add.
	 * @param {object} options - Rendering options passed to the application.
	 * @returns {AdvancementManager} - Prepared manager. Steps count can be used to determine if advancements are needed.
	 */
	static forNewAdvancement(actor, itemId, advancements, options) {
		const manager = new this(actor, options);

		const clonedItem = manager.clone.items.get(itemId);
		if ( !clonedItem || !advancements.length ) return manager;

		const currentLevel = manager.clone.system.details.level;
		const minimumLevel = advancements.reduce((min, a) => Math.min(a.levels[0] ?? Infinity, min), Infinity);
		if ( minimumLevel > currentLevel ) return manager;

		const oldFlows = Array.fromRange(currentLevel + 1).slice(minimumLevel)
			.flatMap(l => this.flowsForLevel(clonedItem, l));

		// Revert advancements through minimum level
		oldFlows.reverse().forEach(flow => manager.steps.push({ type: "reverse", flow, automatic: true }));

		// Add new advancements
		const advancementCollection = clonedItem.system.advancement.toObject();
		advancementCollection.push(...advancements.map(a => {
			const obj = a.toObject();
			if ( obj.constructor.dataModels?.value ) a.value = (new a.constructor.metadata.dataModels.value()).toObject();
			else obj.value = foundry.utils.deepClone(a.constructor.metadata.defaults?.value ?? {});
			return obj;
		}));
		clonedItem.updateSource({"system.advancement": advancementCollection});

		const newFlows = Array.fromRange(currentLevel + 1).slice(minimumLevel)
			.flatMap(l => this.flowsForLevel(clonedItem, l));

		// Restore existing advancements and apply new advancements
		newFlows.forEach(flow => {
			const matchingFlow = oldFlows.find(f => (f.advancement.id === flow.advancement.id) && (f.level === flow.level));
			if ( matchingFlow ) manager.steps.push({ type: "restore", flow: matchingFlow, automatic: true });
			else manager.steps.push({ type: "forward", flow });
		});

		return manager;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Construct a manager for a newly added item.
	 * @param {ActorEH} actor - Actor to which the item is being added.
	 * @param {object} itemData - Data for the item being added.
	 * @param {object} options - Rendering options passed to the application.
	 * @returns {AdvancementManager} - Prepared manager. Steps count can be used to determine if advancements are needed.
	 */
	static forNewItem(actor, itemData, options={}) {
		const manager = new this(actor, options);

		// Prepare data for adding to clone
		const dataClone = foundry.utils.deepClone(itemData);
		dataClone._id = foundry.utils.randomID();

		// Add item to clone & get new instance from clone
		manager.clone.updateSource({items: [dataClone]});
		const clonedItem = manager.clone.items.get(dataClone._id);

		// Create some flows up to current level
		Array.fromRange(manager.clone.system.details.level + 1)
			.flatMap(l => this.flowsForLevel(clonedItem, l))
			.forEach(flow => manager.steps.push({ type: "forward", flow }));

		return manager;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Construct a manager for modifying choices on an item at a specific level.
	 * @param {ActorEH} actor - Actor from which the choices should be modified.
	 * @param {string} itemId - ID of the item whose choices are to be changed.
	 * @param {number} level - Level at which the choices are being changed.
	 * @param {object} options - Rendering options passed to the application.
	 * @returns {AdvancementManager} - Prepared manager. Steps count can be used to determine if advancements are needed.
	 */
	static forModifyChoices(actor, itemId, level, options) {
		const manager = new this(actor, options);

		const clonedItem = manager.clone.items.get(itemId);
		if ( !clonedItem ) return manager;

		const flows = Array.fromRange(manager.clone.system.details.level + 1).slice(level)
			.flatMap(l => this.flowsForLevel(clonedItem, l));

		// Revert advancements through changed level
		flows.reverse().forEach(flow => manager.steps.push({ type: "reverse", flow, automatic: true }));

		// Create forward advancements for level being changed
		flows.reverse().filter(f => f.level === level).forEach(flow => manager.steps.push({ type: "forward", flow }));

		// Create restore advancements for other levels
		flows.filter(f => f.level > level).forEach(flow => manager.steps.push({ type: "restore", flow, automatic: true }));

		return manager;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Construct a manager for an advancement that needs to be deleted.
	 * @param {ActorEH} actor - Actor from which the advancement should be unapplied.
	 * @param {string} itemId - ID of the item from which the advancement should be deleted.
	 * @param {string} advancementId - ID of the advancement to delete.
	 * @param {object} options - Rendering options passed to the application.
	 * @returns {AdvancementManager} - Prepared manager. Steps count can be used to determine if advancements are needed.
	 */
	static forDeletedAdvancement(actor, itemId, advancementId, options) {
		const manager = new this(actor, options);

		const clonedItem = manager.clone.items.get(itemId);
		const advancement = clonedItem?.system.advancement.get(advancementId);
		if ( !advancement ) return manager;

		const minimumLevel = advancement.levels[0];
		const currentLevel = manager.clone.system.details.level;

		// If minimum level is greater than current level, no changes to remove
		if ( minimumLevel > currentLevel ) return manager;

		advancement.levels
			.reverse()
			.filter(l => l <= currentLevel)
			.map(l => new advancement.constructor.metadata.apps.flow(clonedItem, advancementId, l))
			.forEach(flow => manager.steps.push({ type: "reverse", flow, automatic: true }));

		if ( manager.steps.length ) manager.steps.push({ type: "delete", advancement, automatic: true });

		return manager;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Construct a manager for an item that needs to be deleted.
	 * @param {ActorEH} actor - Actor from which the item should be deleted.
	 * @param {string} itemId - ID of the item to be deleted.
	 * @param {object} options - Rendering options passed to the application.
	 * @returns {AdvancementManager} - Prepared manager. Steps count can be used to determine if advancements are needed.
	 */
	static forDeletedItem(actor, itemId, options) {
		const manager = new this(actor, options);
		const clonedItem = manager.clone.items.get(itemId);
		if ( !clonedItem ) return manager;

		// Create some flows down from current level
		Array.fromRange(manager.clone.system.details.level + 1)
			.flatMap(l => this.flowsForLevel(clonedItem, l))
			.reverse()
			.forEach(flow => manager.steps.push({ type: "reverse", flow, automatic: true }));

		// Add a final step to remove the item only if there are advancements to apply
		if ( manager.steps.length ) manager.steps.push({ type: "delete", item: clonedItem, automatic: true });
		return manager;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Construct a manager for a change in a hero's levels.
	 * @param {ActorEH} actor - Actor whose level has changed.
	 * @param {number} levelDelta - Levels by which to increase or decrease the class.
	 * @param {object} options - Rendering options passed to the application.
	 * @returns {AdvancementManager} - Prepared manager. Steps count can be used to determine if advancements are needed.
	 */
	static forLevelChange(actor, levelDelta, options={}) {
		const manager = new this(actor, options);

		// TODO: Rework this so archetype & class don't require special casing, instead follow
		// a well established order (archetype -> class -> background -> profession -> features)
		const pushSteps = (flows, data) => manager.steps.push(...flows.map(flow => ({ flow, ...data })));
		const getItemFlows = level => manager.clone.items.contents.flatMap(i => {
			if ( ["archetype", "class"].includes(i.type) ) return [];
			return this.flowsForLevel(i, level);
		});

		// Level increased
		for ( let offset = 1; offset <= levelDelta; offset++ ) {
			const level = manager.clone.system.details.level + offset;
			const stepData = { type: "forward" };
			manager.steps.push({ type: "level", level: level, backwardLevel: level - 1, automatic: true });
			pushSteps(this.flowsForLevel(manager.clone.system.details.archetype, level), stepData);
			pushSteps(this.flowsForLevel(manager.clone.system.details.class, level), stepData);
			pushSteps(getItemFlows(level), stepData);
		}

		// Level decreased
		for ( let offset = 0; offset > levelDelta; offset-- ) {
			const level = manager.clone.system.details.level + offset;
			const stepData = { type: "reverse", automatic: true };
			pushSteps(getItemFlows(level).reverse(), stepData);
			pushSteps(this.flowsForLevel(manager.clone.system.details.class, level).reverse(), stepData);
			pushSteps(this.flowsForLevel(manager.clone.system.details.archetype, level).reverse(), stepData);
			manager.steps.push({ type: "level", level: level - 1, backwardLevel: level, automatic: true });
		}

		return manager;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Creates advancement flows for all advancements at a specific level.
	 * @param {ItemEH} item - Item that has advancement.
	 * @param {number} level - Level in question.
	 * @returns {AdvancementFlow[]} - Created flow applications.
	 * @protected
	 */
	static flowsForLevel(item, level) {
		if ( !(item?.system.advancement instanceof AdvancementCollection) ) return [];
		return item.system.advancement.byLevel(level).map(a => new a.constructor.metadata.apps.flow(item, a.id, level));
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Form Rendering                           */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	getData() {
		if ( !this.step ) return {};

		// Prepare information for subheading
		const level = this.step.flow.level;
		const visibleSteps = this.steps.filter(s => !s.automatic);
		const visibleIndex = visibleSteps.indexOf(this.step);

		return {
			actor: this.clone,
			flowId: this.step.flow.id,
			header: this.step.flow.item.name,
			subheader: level ? game.i18n.format("EH.Advancement.Core.Level.Specific", { level }) : "",
			steps: {
				current: visibleIndex + 1,
				total: visibleSteps.length,
				hasPrevious: visibleIndex > 0,
				hasNext: visibleIndex < visibleSteps.length - 1
			}
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	render(...args) {
		if ( this.steps.length && (this.#stepIndex === null) ) this.#stepIndex = 0;

		/**
		 * A hook event that fires when an AdvancementManager is about to be processed.
		 * @function everydayHeroes.preAdvancementManagerRender
		 * @memberof hookEvents
		 * @param {AdvancementManager} advancementManager - The advancement manager about to be rendered.
		 * @returns {boolean} - Explicitly return `false` to prevent manager from rendering.
		 */
		if ( Hooks.call("everydayHeroes.preAdvancementManagerRender", this) === false ) return this;

		if ( this.step?.automatic ) {
			if ( this.#advancing ) return this;
			this.#forward();
			return this;
		}

		return super.render(...args);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async _render(force, options) {
		await super._render(force, options);
		if ( (this._state !== Application.RENDER_STATES.RENDERED) || !this.step ) return;

		// Render the step
		this.step.flow._element = null;
		await this.step.flow._render(force, options);
		this.setPosition();
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	activateListeners(html) {
		super.activateListeners(html);
		html.find("button[data-action]").click(event => {
			const buttons = html.find("button");
			buttons.attr("disabled", true);
			html.find(".error").removeClass("error");
			try {
				switch ( event.currentTarget.dataset.action ) {
					case "restart":
						if ( !this.previousStep ) return;
						return this.#restart(event);
					case "previous":
						if ( !this.previousStep ) return;
						return this.#backward(event);
					case "next":
					case "complete":
						return this.#forward(event);
				}
			} finally {
				buttons.attr("disabled", false);
			}
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async close(options={}) {
		if ( !options.skipConfirmation ) {
			return new Dialog({
				title: `${game.i18n.localize("EH.Advancement.Manager.Close.Title")}: ${this.actor.name}`,
				content: `<p>${game.i18n.localize("EH.Advancement.Manager.Close.Message")}</p>`,
				buttons: {
					close: {
						icon: '<i class="fas fa-times"></i>',
						label: game.i18n.localize("EH.Advancement.Manager.Action.Stop"),
						callback: () => super.close(options)
					},
					continue: {
						icon: '<i class="fas fa-chevron-right"></i>',
						label: game.i18n.localize("EH.Advancement.Manager.Action.Continue")
					}
				},
				default: "close"
			}).render(true);
		}
		await super.close(options);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Process                                  */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Advance through the steps until one requiring user interaction is encountered.
	 * @param {Event} [event] - Triggering click event if one occurred.
	 * @returns {Promise}
	 * @private
	 */
	async #forward(event) {
		this.#advancing = true;
		try {
			do {
				const { flow, type } = this.step;

				// Apply changes based on step type
				if ( (type === "delete") && this.step.item ) this.clone.items.delete(this.step.item.id);
				else if ( (type === "delete") && this.step.advancement ) {
					this.step.advancement.item.deleteAdvancement(this.step.advancement.id, { source: true });
				}
				else if ( type === "restore" ) await flow.advancement.restore(flow.level, flow.retainedData);
				else if ( type === "reverse" ) await flow.attachRetainedData(await flow.advancement.reverse(flow.level));
				else if ( type === "level" ) this.clone.updateSource({ "system.details.level": this.step.level });
				else if ( flow ) await flow._updateObject(event, flow._getSubmitData());

				this.#stepIndex++;
				this.clone.reset();
			} while ( this.step?.automatic );
		} catch(error) {
			if ( !(error instanceof Advancement.ERROR) ) throw error;
			ui.notifications.error(error.message);
			this.step.automatic = false;
			if ( this.step.type === "restore" ) this.step.type = "forward";
		} finally {
			this.#advancing = false;
		}

		if ( this.step ) this.render(true);
		else this.#complete();
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Reverse through the steps until one requiring user interaction is encountered.
	 * @param {Event} [event] - Triggering click event if one occurred.
	 * @param {object} [options] - Additional options to configure behavior.
	 * @param {boolean} [options.render=true] - Whether to render the Application after the step has been reversed. Used
	 *                                          by the restart workflow.
	 * @returns {Promise}
	 * @private
	 */
	async #backward(event, { render=true }={}) {
		this.#advancing = true;
		try {
			do {
				this.#stepIndex--;
				if ( !this.step ) break;
				const { flow, type } = this.step;

				// Reverse step based on step type
				if ( (type === "delete") && this.step.item ) this.clone.updateSource({items: [this.step.item]});
				else if ( (type === "delete") && this.step.advancement ) this.advancement.item.createAdvancement(
					this.advancement.typeName, this.advancement._source, { source: true }
				);
				else if ( type === "reverse" ) await flow.advancement.restore(flow.level, flow.retainedData);
				else if ( type === "level" ) this.clone.updateSource({ "system.details.level": this.step.backwardLevel });
				else if ( flow ) await flow.attachRetainedData(await flow.advancement.reverse(flow.level));
				this.clone.reset();
			} while ( this.step?.automatic );
		} catch(error) {
			if ( !(error instanceof Advancement.ERROR) ) throw error;
			ui.notifications.error(error.message);
			this.step.automatic = false;
		} finally {
			this.#advancing = false;
		}

		if ( !render ) return;
		if ( this.step ) this.render(true);
		else this.close({ skipConfirmation: true });
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Reset back to the manager's initial state.
	 * @param {MouseEvent} [event] - The triggering click event if one occurred.
	 * @returns {Promise}
	 * @private
	 */
	async #restart(event) {
		const restart = await Dialog.confirm({
			title: game.i18n.localize("EH.Advancement.Manager.Restart.Title"),
			content: game.i18n.localize("EH.Advancement.Manager.Restart.Message")
		});
		if ( !restart ) return;
		// While there is still a renderable step.
		while ( this.steps.slice(0, this.#stepIndex).some(s => !s.automatic) ) {
			await this.#backward(event, {render: false});
		}
		this.render(true);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Apply changes to actual actor after all choices have been made.
	 * @param {Event} event - Button click that triggered the change.
	 * @returns {Promise}
	 * @private
	 */
	async #complete(event) {
		const updates = this.clone.toObject();
		const items = updates.items;
		delete updates.items;

		// Gather changes to embedded items
		const { toCreate, toUpdate, toDelete } = items.reduce((obj, item) => {
			if ( !this.actor.items.get(item._id) ) {
				obj.toCreate.push(item);
			} else {
				obj.toUpdate.push(item);
				obj.toDelete.findSplice(id => id === item._id);
			}
			return obj;
		}, { toCreate: [], toUpdate: [], toDelete: this.actor.items.map(i => i.id) });

		/**
		 * A hook event that fires at the final stage of a character's advancement process, before actor and item updates
		 * are applied.
		 * @function everydayHeroes.preAdvancementManagerComplete
		 * @memberof hookEvents
		 * @param {AdvancementManager} advancementManager - The advancement manager.
		 * @param {object} actorUpdates - Updates to the actor.
		 * @param {object[]} toCreate - Items that will be created on the actor.
		 * @param {object[]} toUpdate - Items that will be updated on the actor.
		 * @param {string[]} toDelete - IDs of items that will be deleted on the actor.
		 * @returns {boolean} - Explicitly return `false` to prevent changes from being made to the actor.
		 */
		if ( Hooks.call("everydayHeroes.preAdvancementManagerComplete", this,
			updates, toCreate, toUpdate, toDelete) === false ) return this.close({ skipConfirmation: true });

		// Apply changes from clone to original actor
		await Promise.all([
			this.actor.update(updates, { diff: false, recursive: false, isAdvancement: true }),
			this.actor.createEmbeddedDocuments("Item", toCreate, { keepId: true, isAdvancement: true }),
			this.actor.updateEmbeddedDocuments("Item", toUpdate, { isAdvancement: true }),
			this.actor.deleteEmbeddedDocuments("Item", toDelete, { isAdvancement: true })
		]);

		/**
		 * A hook event that fires when an AdvancementManager is done modifying an actor.
		 * @function everydayHeroes.advancementManagerComplete
		 * @memberof hookEvents
		 * @param {AdvancementManager} advancementManager - The advancement manager that just completed.
		 */
		Hooks.callAll("everydayHeroes.advancementManagerComplete", this);

		// Close prompt
		return this.close({ skipConfirmation: true });
	}

}
