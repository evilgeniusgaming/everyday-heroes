import ActiveEffectEH from "../../documents/active-effect.mjs";
import AdvancementManager from "../advancement/advancement-manager.mjs";
import AdvancementConfirmationDialog from "../advancement/advancement-confirmation-dialog.mjs";
import AbilityConfig from "./dialogs/ability-config.mjs";
import AttributesConfig from "./dialogs/attributes-config.mjs";
import HealthConfig from "./dialogs/health-config.mjs";
import SkillConfig from "./dialogs/skill-config.mjs";

/**
 * Base sheet that provides common features for Hero and NPC sheets.
 */
export default class BaseActorSheet extends ActorSheet {
	constructor(actor, options={}) {
		const limited = !game.user.isGM && actor.limited;
		if ( limited ) {
			options.width = 460;
			options.height = "auto";
		}
		options.classes = Array.from(new Set([
			"everyday-heroes", "sheet", "actor", limited ? "limited" : actor.type, ...(options.classes ?? [])
		]));

		super(actor, options);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

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
	 * Is the sheet currently in editing mode?
	 * @type {boolean}
	 */
	editingMode = false;

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

	/**
	 * Is this a limited sheet?
	 * @type {boolean}
	 */
	get limited() {
		return !game.user.isGM && this.actor.limited;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get template() {
		const type = this.limited ? "limited" : this.actor.type;
		return `systems/everyday-heroes/templates/actor/${type}-sheet.hbs`;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Context Preparation                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async getData(options) {
		const context = await super.getData(options);

		context.CONFIG = CONFIG.EverydayHeroes;
		context.system = context.actor.system;

		context.effects = ActiveEffectEH.prepareActiveEffectSections(context.actor.effects);

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
		await this.prepareLists(context);

		context.editingMode = this.editingMode;

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

	/**
	 * Prepare various lists that might be displayed on the actor's sheet.
	 * @param {object} context - Context object for rendering the sheet. **Will be mutated.**
	 */
	async prepareLists(context) {}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Action Handlers                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	activateListeners(jQuery) {
		super.activateListeners(jQuery);
		const html = jQuery[0];

		// Config Action Listeners
		for ( const element of html.querySelectorAll('[data-action="config"]') ) {
			element.addEventListener("click", this._onConfig.bind(this));
		}

		// Editing mode
		html.querySelector('[data-action="toggle-editing-mode"]')?.addEventListener("click", event => {
			this.editingMode = !this.editingMode;
			this.render();
		});

		// Effect Listeners
		for ( const element of html.querySelectorAll('[data-action="effect"]') ) {
			element.addEventListener("click", ActiveEffectEH.onEffectAction.bind(this));
		}

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

		// Tag Inputs
		for ( const element of html.querySelectorAll(".tag-input input") ) {
			element.addEventListener("change", this._onTagInputAction.bind(this, "add"));
		}
		for ( const element of html.querySelectorAll('.tag-input [data-action="delete"]') ) {
			element.addEventListener("click", this._onTagInputAction.bind(this, "delete"));
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_onChangeInput(event) {
		super._onChangeInput(event);

		// Choose ammunition
		if ( event.target.name === "ammunition" ) {
			const ammoId = event.target.value;
			const weaponId = event.target.closest("[data-item-id]")?.dataset.itemId;
			this.actor.update({[`system.items.${weaponId}.ammunition`]: ammoId});
		}

		// Change selected biography editor
		else if ( event.target.name === "editorSelected" ) {
			this.editorSelected = event.target.value;
			this.render();
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle clicking on one of the config buttons.
	 * @param {ClickEvent} event - Triggering click event.
	 * @returns {Promise}
	 */
	_onConfig(event) {
		event.preventDefault();
		const { type, key } = event.currentTarget.dataset;
		switch (type) {
			case "ability":
				return new AbilityConfig(key, this.actor).render(true);
			case "attributes":
				return new AttributesConfig(this.actor).render(true);
			case "health":
				return new HealthConfig(this.actor).render(true);
			case "skill":
				return new SkillConfig(key, this.actor).render(true);
			default:
				return console.warn(`Everyday Heroes | Invalid config action type clicked ${type}.`);
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle clicking on the proficiency selector for abilities or skills.
	 * @param {ClickEvent} event - Triggering click event.
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
	 * @param {ClickEvent} event - Triggering click event.
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
				let data;
				try {
					data = JSON.parse(decodeURI(event.currentTarget.dataset.data ?? ""));
					if ( !data.type ) return;
					data = foundry.utils.mergeObject({
						name: game.i18n.format("EH.Item.New", {type: game.i18n.localize(CONFIG.Item.typeLabels[data.type])})
					}, data);
					return this.actor.createEmbeddedDocuments("Item", [data]);
				} catch(err) { return; }
			case "chat":
				return item?.displayInChat();
			case "delete":
				const manager = AdvancementManager.forDeletedItem(this.actor, id);
				if ( manager.steps.length ) {
					try {
						if ( await AdvancementConfirmationDialog.forDelete(item) ) return manager.render(true);
					} catch(err) { return; }
				}
				return item.deleteDialog();
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
			case "mode":
				if ( !item || !key ) return;
				return this.actor.update({[`system.items.${id}.mode`]: key});
			case "reload":
				return item?.reload();
			case "unjam":
				return item?.unjam();
			default:
				return console.warn(`Everyday Heroes | Invalid item action type clicked ${type}.`);
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
		const { type, ...options } = event.currentTarget.dataset;
		delete options.action;
		delete options.tooltip;
		Object.entries(options).forEach(([k, v]) => {
			if ( v === "true" ) options[k] = true;
			else if ( v === "false" ) options[k] = false;
			else if ( Number.isNumeric(v) ) options[k] = Number(v);
		});

		switch (type) {
			case "activate":
				return item.activate({ event, options });
			case "armor-save":
				return item.rollArmorSave({ event, options });
			case "attack":
				return item.rollAttack({ event, options });
			case "damage":
				return item.rollDamage({ event, options });
			default:
				return console.warn(`Everyday Heroes | Invalid item roll type clicked ${type}.`);
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
				return this.actor.rollAbilityCheck({ ability: key, event });
			case "ability-save":
				return this.actor.rollAbilitySave({ ability: key, event });
			case "death-save":
				return this.actor.rollDeathSave({ event });
			case "hit-die":
				return this.actor.rollHitDie({ event });
			case "initiative":
				return this.actor.rollInitiative({ event });
			case "luck":
				return this.actor.rollLuckSave({ event });
			case "resource":
				return this.actor.rollResource({ resource: key, event });
			case "skill":
				return this.actor.rollSkill({ skill: key, event });
			default:
				return console.warn(`Everyday Heroes | Invalid roll type clicked ${type}.`);
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle actions associated with tag inputs.
	 * @param {string} type - Action type being handled.
	 * @param {ClickEvent} event - Triggering click event.
	 * @returns {Promise}
	 */
	async _onTagInputAction(type, event) {
		event.preventDefault();
		const tagInput = event.target.closest(".tag-input");
		if ( !tagInput ) return;
		const name = tagInput.dataset.target;
		const shouldValidate = tagInput.dataset.validate;
		const collection = foundry.utils.getProperty(this.actor, name);

		switch (type) {
			case "add":
				const validOptions = Array.from(event.target.list?.options ?? []).map(o => o.value);
				if ( shouldValidate && !validOptions.includes(event.target.value) ) return;
				if ( foundry.utils.getType(collection) === "Array" ) collection.push(event.target.value);
				else if ( foundry.utils.getType(collection) === "Set" ) collection.add(event.target.value);
				else console.warn("Invalid collection type found for tag input");
				break;
			case "delete":
				const key = event.target.closest("[data-key]")?.dataset.key;
				if ( foundry.utils.getType(collection) === "Array" ) collection.findSplice(v => v === key);
				else if ( foundry.utils.getType(collection) === "Set" ) collection.delete(key);
				else console.warn("Invalid collection type found for tag input");
				break;
			default:
				return console.warn(`Invalid tag action type ${type}`);
		}
		this.actor.update({[name]: Array.from(collection)});
	}
}
