import ActiveEffectEH from "../../documents/active-effect.mjs";
import { numberFormat, registerTagInputListeners, sortObjectEntries, systemLog } from "../../utils.mjs";
import AdvancementManager from "../advancement/advancement-manager.mjs";
import AdvancementConfirmationDialog from "../advancement/advancement-confirmation-dialog.mjs";
import AbilityConfig from "./dialogs/ability-config.mjs";
import ActionConfig from "./dialogs/action-config.mjs";
import AttributesConfig from "./dialogs/attributes-config.mjs";
import HealthConfig from "./dialogs/health-config.mjs";
import InitiativeConfig from "./dialogs/initiative-config.mjs";
import ResourceConfig from "./dialogs/resource-config.mjs";
import SkillConfig from "./dialogs/skill-config.mjs";
import SpeedConfig from "./dialogs/speed-config.mjs";

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
			"everyday-heroes", "sheet", "actor",
			limited ? "limited" : actor.system?.constructor.metadata?.type ?? actor.type,
			...(options.classes ?? [])
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
	 * Is the sheet currently in a mode to add new conditions?
	 * @type {boolean}
	 */
	conditionAddMode = false;

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
		context.source = context.system.toObject();

		context.effects = ActiveEffectEH.prepareActiveEffectSections(context.actor.effects);

		const modFormatter = new Intl.NumberFormat(game.i18n.lang, { signDisplay: "always" });

		if ( context.system.abilities ) {
			context.abilities = foundry.utils.deepClone(context.system.abilities);
			for ( const [id, ability] of Object.entries(context.abilities) ) {
				const abilityConfig = CONFIG.EverydayHeroes.abilities[id];
				ability.label = abilityConfig.label;
				ability.abbreviation = abilityConfig.abbreviation;
				ability.mod = modFormatter.format(ability.mod);
				ability.save = modFormatter.format(ability.save);
			}
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

		await this.prepareConditions(context);
		await this.prepareItems(context);
		await this.prepareLists(context);

		context.conditionAddMode = this.conditionAddMode;
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
	 * Prepare conditions for display.
	 * @param {object} context - Context object for rendering the sheet. **Will be mutated.**
	 */
	async prepareConditions(context) {
		context.conditions = {};
		if ( this.conditionAddMode ) {
			for ( const key of CONFIG.EverydayHeroes.applicableConditions[
				this.actor.system.constructor.metadata?.type ?? this.actor.type
			] ?? [] ) {
				const config = CONFIG.EverydayHeroes.conditions[key];
				const registered = CONFIG.EverydayHeroes.registration.all.condition?.[key];
				if ( context.system.conditions[key] || !registered ) continue;
				const document = await fromUuid(registered?.sources[0]);
				context.conditions[key] = {
					label: registered?.name ?? config.label,
					levels: null,
					document,
					value: 0
				};
			}
		} else {
			for ( const [key, value] of Object.entries(context.system.conditions) ) {
				const config = CONFIG.EverydayHeroes.conditions[key];
				const registered = CONFIG.EverydayHeroes.registration.all.condition?.[key];
				if ( !config && !registered ) continue;
				const document = await fromUuid(registered?.sources[0]);
				const levels = document?.system.levels.length ?? config.levels ?? 1;
				context.conditions[key] = {
					label: registered?.name ?? config.label,
					levels: (levels > 1) ? Array.fromRange(levels).map(idx => ({
						number: numberFormat(idx + 1),
						selected: value > idx,
						description: document?.system.levels[idx]?.description ?? ""
					})) : null,
					document,
					value
				};
			}
		}
		context.conditions = sortObjectEntries(context.conditions, "label");
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare the items for display on the sheet.
	 * @param {object} context - Context object for rendering the sheet. **Will be mutated.**
	 */
	async prepareItems(context) {}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Sort provided items into sections defined in `CONFIG.EverydayHeroes.sheetSections` for this actor type.
	 * @param {object} context - Context object for rendering the sheet. **Will be mutated.**
	 * @param {async Function} callback - Method called for each item after it is added to a section.
	 */
	async _prepareItemSections(context, callback) {
		const sections = this._buildSections();
		context.itemContext ??= {};

		for ( const item of Array.from(context.actor.items).sort((a, b) => a.sort - b.sort) ) {
			const section = this._organizeItem(item, sections);
			const ctx = context.itemContext[item.id] ??= {};
			if ( foundry.utils.getType(callback) === "function" ) await callback(item, section, ctx);

			// Prepare expanded data
			if ( this.itemsExpanded.has(item.id) ) {
				ctx.expandedData = await item.chatContext({secrets: this.actor.isOwner});
			}
		}

		for ( const tab of Object.values(sections) ) {
			for ( const [key, section] of Object.entries(tab) ) {
				if ( !this.editingMode && section.options?.autoHide
						&& !section.items.length && !section.limits?.max ) delete tab[key];
				else if ( section.primary && (!section.primary.item || section.primary.dataset.multiple) ) {
					section.create.unshift({ label: section.primary.label, dataset: section.primary.dataset });
				}
			}
		}

		Object.entries(sections).forEach(([key, section]) => context[key] = section);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Construct sheet sections based on data in `CONFIG.EverydayHeroes.sheetSections`.
	 * @returns {object}
	 * @internal
	 */
	_buildSections() {
		const sections = {};
		const formatter = new Intl.ListFormat(game.i18n.lang, {style: "short", type: "conjunction"});
		const typeModels = CONFIG.Item.dataModels;

		const type = this.actor.system.constructor.metadata?.type ?? this.actor.type;
		for ( const config of CONFIG.EverydayHeroes.sheetSections[type] ?? [] ) {
			const tab = sections[config.tab] ??= {};
			const primaryType = typeModels[config.primaryType?.type];
			const types = config.types.map(t => ({ dataset: t, model: typeModels[t.type] })).filter(t => t.model);
			const id = config.id ?? (primaryType ? primaryType.metadata.type : types.map(t => t.model.metadata.type).join("-"));
			const section = tab[id] = { config, items: [], options: config.options };

			// Use custom label, singular for primary items, or plural list for others
			if ( config.label ) section.label = game.i18n.localize(config.label);
			else if ( primaryType ) section.label = game.i18n.localize(
				`${primaryType.metadata.sheetLocalization ?? primaryType.metadata.localization}[one]`
			);
			else section.label = formatter.format(types.map(t =>
				game.i18n.localize(`${t.model.metadata.sheetLocalization ?? t.model.metadata.localization}[other]`)
			));

			// Add create options
			if ( primaryType ) section.primary = { item: null, label: section.label, dataset: config.primaryType };
			if ( config.create ) {
				section.create = config.create;
			} else {
				section.create = types.map(({dataset, model}) => ({
					label: `${model.metadata.sheetLocalization ?? model.metadata.localization}[one]`,
					dataset
				}));
			}

			// Add limits
			section.limits = this.actor.system.details?.limits?.[config.options?.limited];
		}

		return sections;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Place an item in the appropriate section.
	 * @param {ItemEH} item - Item to organize.
	 * @param {object} sections - Sections to populate.
	 * @returns {object} - Section into which the item was inserted.
	 * @internal
	 */
	_organizeItem(item, sections) {
		const checkFilter = (item, filter) => Object.entries(filter)
			.every(([key, value]) => {
				const source = foundry.utils.getProperty(item, key);
				switch ( foundry.utils.getType(source) ) {
					case "Array": return source.includes(value);
					case "Set": return source.has(value);
					default: return source === value;
				}
			});

		for ( const tab of Object.values(sections) ) {
			for ( const section of Object.values(tab) ) {
				const { multiple: _, ...primaryConfig } = section.config.primaryType ?? {};
				if ( section.primary && checkFilter(item, primaryConfig) ) {
					section.primary.item ??= [];
					section.primary.item.push(item);
					return section;
				}
				for ( const type of section.config?.types ?? [] ) {
					if ( checkFilter(item, type) ) {
						section.items.push(item);
						return section;
					}
				}
			}
		}

		// No matching section found, add to uncategorized section if editing mode is enabled
		if ( !this.editingMode ) return;
		const firstTab = Object.keys(sections)[0];
		const section = sections[firstTab].uncategorized ??= {
			label: game.i18n.localize("EH.Item.Type.Unidentified[other]"), items: []
		};
		section.items.push(item);
		return section;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare ammunition lists on weapons.
	 * @param {object} context - Context object for rendering the sheet.
	 * @param {ItemEH[]} items - Weapons to prepare.
	 */
	_prepareItemAmmunition(context, items) {
		for ( const item of items ) {
			const ctx = context.itemContext[item.id].ammunition ??= {};
			const ammunitionTypeConfig = CONFIG.EverydayHeroes.ammunitionTypes[item.system.rounds.type];
			ctx.defaultLabel = ammunitionTypeConfig ? game.i18n.format("EH.Ammunition.Standard.Label", {
				type: ammunitionTypeConfig.label
			}) : game.i18n.localize("EH.Ammunition.Empty.Label");
			ctx.selected = item.system.ammunition?.id;
			ctx.types = context.ammunitionTypes[item.system.rounds.type] ?? [];
			ctx.displayAmmunitionSelector = (!foundry.utils.isEmpty(ctx.types) || ctx.defaultLabel)
				&& !!item.system.rounds.type;
		}
	}

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

		// Condition Action Listeners
		for ( const element of html.querySelectorAll('[data-action="condition"]') ) {
			element.addEventListener("click", this._onConditionAction.bind(this));
		}

		// Config Action Listeners
		for ( const element of html.querySelectorAll('[data-action="config"]') ) {
			element.addEventListener("click", this._onConfig.bind(this));
		}

		// Editing mode
		html.querySelector('[data-action="toggle-editing-mode"]')?.addEventListener("click", event => {
			this.editingMode = !this.editingMode;
			this.render();
		});

		// Editor selector
		for ( const element of html.querySelectorAll('[name="editorSelected"]') ) {
			element.addEventListener("change", event => {
				this.editorSelected = event.target.value;
				this.render();
			});
		}

		// Effect Listeners
		for ( const element of html.querySelectorAll('[data-action="effect"]') ) {
			element.addEventListener("click", ActiveEffectEH.onEffectAction.bind(this));
		}

		// Proficiency Selector Listeners
		for ( const element of html.querySelectorAll('[data-action="cycle-proficiency"]') ) {
			element.addEventListener("click", this._onCycleProficiency.bind(this));
			element.addEventListener("contextmenu", this._onCycleProficiency.bind(this));
		}

		// Hit Points & Damage
		for ( const element of html.querySelectorAll(':is([name$=".hp.value"], [name$=".hp.damage"])') ) {
			element.addEventListener("change", this._onChangeHP.bind(this));
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
		registerTagInputListeners(this, html);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_disableFields(form) {
		super._disableFields(form);
		form.querySelectorAll('[name="editorSelected"]').forEach(f => f.disabled = false);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle changes to the HP and damage on character sheets.
	 * @param {Event} event - Triggering event.
	 * @returns {Promise}
	 */
	_onChangeHP(event) {
		event.stopPropagation();
		let value = event.target.value.trim();
		let delta;
		if ( value.startsWith("+") || value.startsWith("-") ) delta = parseInt(value);
		else {
			if ( value.startsWith("=") ) value = value.slice(1);
			delta = parseInt(value) - foundry.utils.getProperty(this.actor, event.target.name);
		}

		return this.actor.applyDamage([{ value: delta }], {
			ignoreImmunity: true,
			ignoreReduction: true,
			multiplier: event.target.name.endsWith(".damage") ? 1 : -1
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_onChangeInput(event) {
		// Input deltas
		if ( event.target.dataset.delta !== undefined ) {
			const value = event.target.value.trim();
			if ( value.startsWith("+") || value.startsWith("-") ) {
				const delta = parseFloat(value);
				event.target.value = Number(foundry.utils.getProperty(this.actor, event.target.name)) + delta;
			} else if ( value.startsWith("=") ) {
				event.target.value = value.slice(1);
			}
		}

		super._onChangeInput(event);

		// Choose ammunition
		if ( event.target.name === "ammunition" ) {
			const ammoId = event.target.value ? event.target.value : null;
			const weaponId = event.target.closest("[data-item-id]")?.dataset.itemId;
			this.actor.update({[`system.items.${weaponId}.ammunition`]: ammoId});
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle actions relating to conditions.
	 * @param {ClickEvent} event - Triggering click event.
	 * @returns {Promise}
	 */
	_onConditionAction(event) {
		event.preventDefault();
		const { type, level } = event.currentTarget.dataset;
		const condition = event.target.closest("[data-condition]")?.dataset.condition;
		switch (type) {
			case "add":
				this.conditionAddMode = !this.conditionAddMode;
				return this.render();
			case "delete":
				return this.actor.system.setConditionLevel(condition);
			case "set-level":
				this.conditionAddMode = false;
				return this.actor.system.setConditionLevel(condition, level);
			default:
				return systemLog(`Invalid condition action type clicked ${type}`, { level: "warn" });
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
			case "action":
				return new ActionConfig(this.actor).render(true);
			case "attributes":
				return new AttributesConfig(this.actor).render(true);
			case "health":
				return new HealthConfig(this.actor).render(true);
			case "initiative":
				return new InitiativeConfig(this.actor).render(true);
			case "resource":
				return new ResourceConfig(key, this.actor).render(true);
			case "skill":
				return new SkillConfig(key, this.actor).render(true);
			case "speed":
				return new SpeedConfig(this.actor).render(true);
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
					const document = await this.actor.createEmbeddedDocuments("Item", [data]);
					return document[0].sheet.render(true);
				} catch(err) { return; }
			case "armor-damage":
				return item?.update({"system.damaged": true});
			case "armor-repair":
				return item?.update({"system.damaged": false});
			case "chat":
				return item?.displayInChat();
			case "clear-jam":
				return item?.clearJam();
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
				if ( item.system._modeOverride ) await item.update({"system._modeOverride": null});
				return this.actor.update({[`system.items.${id}.mode`]: key});
			case "reload":
				return item?.reload();
			case "suppressive-fire":
				return item?.suppressiveFire();
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

		return item.roll(type, { event, options });
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle one of the rolling actions on the sheet.
	 * @param {Event} event - Triggering click event.
	 * @returns {Promise}
	 */
	_onRollAction(event) {
		event.preventDefault();
		const { type, ...config } = event.currentTarget.dataset;
		config.event = event;
		return this.actor.roll(type, config);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Drag & Drop                              */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async _onDropItem(event, data) {
		if ( !this.actor.isOwner ) return false;
		const item = await Item.implementation.fromDropData(data);
		const itemData = item.toObject();

		// Handle item sorting within the same Actor
		if ( this.actor.uuid === item.parent?.uuid ) return this._onSortItem(event, itemData);

		// Handle dropping condition items specifically
		if ( item.type === "condition" ) return this._onDropCondition(event, item);

		// Create the owned item
		return this._onDropItemCreate(event, itemData);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async _onDropFolder(event, data) {
		if ( !this.actor.isOwner ) return [];
		const folder = await Folder.implementation.fromDropData(data);
		if ( folder.type !== "Item" ) return [];
		const droppedItems = await Promise.all(folder.contents.map(async item => {
			if ( !(document instanceof Item) ) item = await fromUuid(item.uuid);
			return item;
		}));

		// Handle dropping condition items specifically
		const conditions = droppedItems.filter(i => i.type === "condition");
		await this._onDropCondition(event, conditions);

		// Create the owned items
		return this._onDropItemCreate(event, droppedItems.map(i => i.toObject()).filter(i => i.type !== "condition"));
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle the final creation of dropped Item data on the Actor.
	 * @param {DragEvent} event - The concluding DragEvent which contains drop target.
	 * @param {object[]|object} itemData - The item data requested for creation.
	 * @returns {Promise<Item[]>}
	 */
	async _onDropItemCreate(event, itemData) {
		itemData = itemData instanceof Array ? itemData : [itemData];
		return this.actor.createEmbeddedDocuments("Item", itemData);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle setting or increasing a condition that is dropped onto the actor.
	 * @param {DragEvent} event - The concluding DragEvent which contains drop target.
	 * @param {ItemEH[]|ItemEH} items - The item requested for creation.
	 * @returns {Promise<ActorEH>}
	 */
	async _onDropCondition(event, items) {
		items = items instanceof Array ? items : [items];
		const toAdd = [];
		for ( const condition of items ) {
			const existingLevel = this.actor.system.conditions[condition.identifier];
			const effect = condition.system.levels[existingLevel ?? 0]?.effect;
			if ( !effect ) continue;
			const obj = effect.toObject();
			if ( foundry.utils.hasProperty(obj, "flags.core.statusId") ) delete obj.flags.core.statusId;
			toAdd.push(obj);
		}
		return this.actor.createEmbeddedDocuments("ActiveEffect", toAdd);
	}
}
