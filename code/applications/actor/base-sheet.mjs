import AdvancementManager from "../advancement/advancement-manager.mjs";
import AdvancementConfirmationDialog from "../advancement/advancement-confirmation-dialog.mjs";

/**
 * Base sheet that provides common features for Hero and NPC sheets.
 */
export default class BaseSheet extends ActorSheet {

	/**
	 * Fields that will be enriched during data preparation.
	 * @type {object}
	 */
	static enrichedFields = {
		biography: "system.biography.value",
		public: "system.biography.public"
	};

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Which editor is currently visible on the biography tab.
	 * @type {string}
	 */
	editorSelected = "biography";

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * IDs for items on the sheet that have been expanded.
	 * @type {Set<string>}
	 */
	itemsExpanded = new Set();

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Context Preparation                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async getData(options) {
		const context = await super.getData(options);

		context.CONFIG = CONFIG.EverydayHeroes;
		context.system = context.actor.system;

		const modFormatter = new Intl.NumberFormat(game.i18n.lang, { signDisplay: "exceptZero" });

		context.abilities = foundry.utils.deepClone(context.system.abilities);
		for ( const [id, ability] of Object.entries(context.abilities) ) {
			const abilityConfig = CONFIG.EverydayHeroes.abilities[id];
			ability.label = abilityConfig.label;
			ability.abbreviation = abilityConfig.abbreviation;
			ability.mod = modFormatter.format(ability.mod);
			ability.save = modFormatter.format(ability.save);
		}

		if ( context.system.skills ) {
			context.skills = foundry.utils.deepClone(context.system.skills);
			for ( const [id, skill] of Object.entries(context.skills) ) {
				const skillConfig = CONFIG.EverydayHeroes.skills[id];
				const abilityConfig = CONFIG.EverydayHeroes.abilities[skill.ability];
				skill.label = skillConfig.label;
				skill.abilityAbbreviation = abilityConfig?.abbreviation;
				skill.mod = modFormatter.format(skill.mod);
			}
		}

		await this.prepareItems(context);

		const enrichmentContext = {
			secrets: this.actor.isOwner, rollData: this.actor.getRollData(), async: true, relativeTo: this.actor
		};
		context.enriched = {};
		for ( const [key, path] of Object.entries(this.constructor.enrichedFields) ) {
			context.enriched[key] = await TextEditor.enrichHTML(foundry.utils.getProperty(context, path), enrichmentContext);
		}
		context.editorSelected = this.editorSelected;

		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare the items for display on the sheet.
	 * @param {object} context - Context object for rendering the sheet. **Will be mutated.**
	 */
	async prepareItems(context) {}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Action Handlers                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	activateListeners(jQuery) {
		super.activateListeners(jQuery);
		const html = jQuery[0];

		// Proficiency Selector Listeners
		for ( const element of html.querySelectorAll('[data-action="cycle-proficiency"]') ) {
			element.addEventListener("click", this._onCycleProficiency.bind(this));
			element.addEventListener("contextmenu", this._onCycleProficiency.bind(this));
		}

		// Item Action Listeners
		for ( const element of html.querySelectorAll('[data-action="item"]') ) {
			element.addEventListener("click", this._onItemAction.bind(this));
		}

		// Rest Action Listeners
		html.querySelector('[data-action="long-rest"]')?.addEventListener("click", this.actor.longRest.bind(this.actor));
		html.querySelector('[data-action="short-rest"]')?.addEventListener("click", this.actor.shortRest.bind(this.actor));

		// Item Roll Action Listeners
		for ( const element of html.querySelectorAll('[data-action="roll-item"]') ) {
			element.addEventListener("click", this._onItemRoll.bind(this));
		}

		// Roll Action Listeners
		for ( const element of html.querySelectorAll('[data-action="roll"]') ) {
			element.addEventListener("click", this._onRollAction.bind(this));
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_onChangeInput(event) {
		super._onChangeInput(event);
		if ( event.target.name === "ammunition" ) {
			const ammoId = event.target.value;
			const weaponId = event.target.closest("[data-item-id]")?.dataset.itemId;
			this.actor.update({[`system.items.${weaponId}.ammunition`]: ammoId});
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle clicking on the proficiency selector for abilities or skills.
	 * @param {Event} event - Triggering click event.
	 * @returns {Promise|void}
	 */
	_onCycleProficiency(event) {
		event.preventDefault();
		if ( event.currentTarget.classList.contains("disabled") ) return;
		const name = event.currentTarget.dataset.name;
		const input = event.currentTarget.querySelector(`input[name="${name}.multiplier"]`);
		const value = foundry.utils.getProperty(this.actor._source, `${name}.multiplier`) ?? 0;
		const levels = event.currentTarget.dataset.type === "single" ? 2 : 3;
		input.value = (value + (event.type === "contextmenu" ? levels - 1 : 1)) % levels;
		return this._onSubmit(event);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle one of the item actions in the features or inventory lists.
	 * @param {Event} event - Triggering click event.
	 * @returns {Promise}
	 */
	async _onItemAction(event) {
		event.preventDefault();
		const container = event.currentTarget.closest("[data-item-id]");
		const id = container?.dataset.itemId;
		const item = id ? this.actor.items.get(id) : null;
		const { type, key } = event.currentTarget.dataset;
		switch (type) {
			case "add":
				return console.log("ADD ITEM");
			case "chat":
				return item?.displayInChat();
			case "edit":
				return item?.sheet.render(true);
			case "equip":
				return this.actor.update({[`system.items.${item.id}.equipped`]: !item.isEquipped});
			case "expand":
				if ( this.itemsExpanded.has(id) ) {
					this.itemsExpanded.delete(id);
					const summary = $(container.querySelector(".item-summary"));
					summary.slideUp(200, () => summary.remove());
					// TODO: Remove this animation if core reduce animation setting is set
				} else if ( item ) {
					this.itemsExpanded.add(id);
					const summary = $(await renderTemplate(
						"systems/everyday-heroes/templates/item/item-summary.hbs",
						await item.chatContext({secrets: this.actor.isOwner})
					));
					container.insertAdjacentElement("beforeend", summary.hide()[0]);
					summary.slideDown(200);
					// TODO: Remove this animation if core reduce animation setting is set
				}
				return;
			case "delete":
				const manager = AdvancementManager.forDeletedItem(this.actor, id);
				if ( manager.steps.length ) {
					try {
						if ( await AdvancementConfirmationDialog.forDelete(item) ) return manager.render(true);
					} catch(err) { return; }
				}
				return item.deleteDialog();
			case "mode":
				if ( !item || !key ) return;
				return this.actor.update({[`system.items.${id}.mode`]: key});
			case "reload":
				return item?.reload();
			default:
				return console.warn(`Invalid item action type clicked ${type}.`);
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle an item's roll action.
	 * @param {Event} event - Triggering click event.
	 * @returns {Promise}
	 */
	async _onItemRoll(event) {
		event.preventDefault();
		const id = event.currentTarget.closest("[data-item-id]")?.dataset.itemId;
		const item = id ? this.actor.items.get(id) : null;
		if ( !item ) return null;

		// Prepare the options passed to the roll
		const { type, ...dataset } = event.currentTarget.dataset;
		delete dataset.action;
		delete dataset.tooltip;
		Object.entries(dataset).forEach(([k, v]) => {
			if ( v === "true" ) dataset[k] = true;
			else if ( v === "false" ) dataset[k] = false;
			else if ( Number.isNumeric(v) ) dataset[k] = Number(v);
		});

		switch (type) {
			case "activate":
				return item.activate({ options: dataset });
			case "armor-save":
				return item.rollArmorSave({ options: dataset });
			case "attack":
				return item.rollAttack({ options: dataset });
			case "damage":
				return item.rollDamage({ options: dataset });
			default:
				return console.warn(`Invalid item roll type clicked ${type}.`);
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle one of the rolling actions on the sheet.
	 * @param {Event} event - Triggering click event.
	 * @returns {Promise}
	 */
	_onRollAction(event) {
		event.preventDefault();
		const { type, key } = event.currentTarget.dataset;
		switch (type) {
			case "ability-check":
				return this.actor.rollAbilityCheck(key);
			case "ability-save":
				return this.actor.rollAbilitySave(key);
			case "death-save":
				return this.actor.rollDeathSave();
			case "hit-die":
				return this.actor.rollHitDie();
			case "initiative":
				return this.actor.rollInitiative();
			case "luck":
				return this.actor.rollLuckSave();
			case "resource":
				return this.actor.rollResource(key);
			case "skill":
				return this.actor.rollSkill(key);
			default:
				return console.warn(`Invalid roll type clicked ${type}.`);
		}
	}
}
