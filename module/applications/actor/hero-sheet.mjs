import AdvancementConfirmationDialog from "../advancement/advancement-confirmation-dialog.mjs";
import AdvancementManager from "../advancement/advancement-manager.mjs";

/**
 * Sheet that represents a Hero actor.
 */
export default class HeroSheet extends ActorSheet {

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["everyday-heroes", "sheet", "actor", "hero"],
			template: "systems/everyday-heroes/templates/actor/hero-sheet.hbs",
			tabs: [{navSelector: 'nav[data-group="primary"]', contentSelector: "main", initial: "details"}],
			width: 820,
			height: 720,
			dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Is the editor expanded on the biography tab.
	 * @type {boolean}
	 */
	editorExpanded = false;

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

		context.skills = foundry.utils.deepClone(context.system.skills);
		for ( const [id, skill] of Object.entries(context.skills) ) {
			const skillConfig = CONFIG.EverydayHeroes.skills[id];
			const abilityConfig = CONFIG.EverydayHeroes.abilities[skill.ability];
			skill.label = skillConfig.label;
			skill.abilityAbbreviation = abilityConfig?.abbreviation;
			skill.mod = modFormatter.format(skill.mod);
		}

		await this.prepareItems(context);

		const enrichmentContext = {
			secrets: this.actor.isOwner, rollData: this.actor.getRollData(), async: true, relativeTo: this.actor
		};
		context.enriched = {
			biography: await TextEditor.enrichHTML(context.system.biography.value, enrichmentContext),
			public: await TextEditor.enrichHTML(context.system.biography.public, enrichmentContext),
			notes: await TextEditor.enrichHTML(context.system.biography.notes, enrichmentContext)
		};
		context.editorExpanded = this.editorExpanded;
		context.editorSelected = this.editorSelected;

		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare the items for display on the sheet.
	 * @param {object} context - Context object for rendering the sheet. **Will be mutated.**
	 */
	async prepareItems(context) {
		context.itemContext = {};

		context.equipped = {
			armor: {
				label: "EH.Item.Type.Armor[other]",
				items: []
			},
			weapons: {
				label: "EH.Item.Type.Weapon[other]",
				items: []
			}
		};

		context.features = {
			archetype: {
				label: "EH.Item.Type.Archetype[one]",
				primary: {
					item: null,
					dataset: {type: "archetype"}
				},
				items: [],
				create: [
					{ dataset: {type: "talent", "system.type.value": "archetype"} }
				]
			},
			class: {
				label: "EH.Item.Type.Class[one]",
				primary: {
					item: null,
					dataset: {type: "class"}
				},
				items: [],
				create: [
					{ dataset: {type: "talent", "system.type.value": "class"} }
				]
			},
			background: {
				label: "EH.Item.Type.Background[one]",
				primary: {
					item: null,
					dataset: {type: "background"}
				},
				items: [],
				create: [
					{ dataset: {type: "talent", "system.type.value": "background"} }
				]
			},
			profession: {
				label: "EH.Item.Type.Profession[one]",
				primary: {
					item: null,
					dataset: {type: "profession"}
				},
				items: [],
				create: [
					{ dataset: {type: "talent", "system.type.value": "profession"} }
				]
			},
			feats: {
				label: "EH.Item.Type.Feat[other]",
				items: [],
				create: [
					{ dataset: {type: "feat"} }
				]
			}
		};

		const formatter = new Intl.ListFormat(game.i18n.lang, {style: "short", type: "conjunction"});
		context.inventory = {
			armor: {
				label: "EH.Item.Type.Armor[other]",
				items: [],
				options: { equippable: true },
				create: [
					{
						label: "EH.Item.Type.Armor[one]",
						icon: "artwork/svg/equipment/armor.svg",
						dataset: {type: "armor"}
					}
				]
			},
			weapons: {
				label: "EH.Item.Type.Weapon[other]",
				items: [],
				options: { equippable: true },
				create: [
					{
						label: "EH.Item.Type.Weapon[one]",
						icon: "artwork/svg/equipment/weapon.svg",
						dataset: {type: "weapon"}
					}
				]
			},
			ammunitionExplosives: {
				label: formatter.format([
					game.i18n.localize("EH.Item.Type.Ammunition[other]"),
					game.i18n.localize("EH.Item.Type.Explosive[other]")
				]),
				items: [],
				create: [
					{
						label: "EH.Item.Type.Ammunition[one]",
						icon: "artwork/svg/equipment/ammunition.svg",
						dataset: {type: "ammunition"}
					},
					{
						label: "EH.Item.Type.Explosive[one]",
						icon: "artwork/svg/equipment/explosive.svg",
						dataset: {type: "explosive"}
					}
				]
			},
			gear: {
				label: "EH.Item.Type.Gear[other]",
				items: [],
				create: [
					{
						label: "EH.Item.Type.Gear[one]",
						icon: "artwork/svg/equipment/gear.svg",
						dataset: {type: "gear"}
					}
				]
			}
		};

		const items = [...context.actor.items].sort((a, b) => a.sort - b.sort);
		for ( const item of items ) {
			const ctx = context.itemContext[item.id] ??= { actions: [] };
			switch (item.type) {
				case "archetype":
					context.features.archetype.primary.item = item;
					break;
				case "class":
					context.features.class.primary.item = item;
					break;
				case "background":
					context.features.background.primary.item = item;
					break;
				case "profession":
					context.features.profession.primary.item = item;
					break;
				case "specialFeature":
				case "talent":
					if ( context.features[item.system.type.value] ) {
						context.features[item.system.type.value].items.push(item);
						break;
					}
					// TODO: Add warning about talent not associated with item type
				case "feat":
					context.features.feats.items.push(item);
					break;
				case "armor":
					context.inventory.armor.items.push(item);
					break;
				case "weapon":
					context.inventory.weapons.items.push(item);
					ctx.actions.push({ label: "Fire" });
					if ( item.system.properties.has("burst") ) ctx.actions.push({ label: "Burst" });
					ctx.actions.push({ label: "Damage" });
					break;
				case "ammunition":
				case "explosive":
					context.inventory.ammunitionExplosives.items.push(item);
					ctx.actions.push({ label: "Damage" });
					break;
				case "gear":
					context.inventory.gear.items.push(item);
					break;
			}

			// Prepare expanded data
			if ( this.itemsExpanded.has(item.id) ) {
				ctx.expandedData = await item.chatContext({secrets: this.actor.isOwner});
			}
		}

		// TODO: Add additional create buttons for archetype, class, background, & profession if a primary
		// item doesn't exist for those categories.
	}

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
		html.querySelector('[data-action="long-rest"]').addEventListener("click", this.actor.longRest.bind(this.actor));
		html.querySelector('[data-action="short-rest"]').addEventListener("click", this.actor.shortRest.bind(this.actor));

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
						"systems/everyday-heroes/templates/item/parts/item-summary.hbs",
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
			case "ability":
				return this.actor.rollAbility(key);
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
			case "skill":
				return this.actor.rollSkill(key);
			default:
				return console.warn(`Invalid roll type clicked ${type}.`);
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
