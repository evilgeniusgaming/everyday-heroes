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

		this.prepareItems(context);

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
	prepareItems(context) {
		context.itemContext = {};

		context.equipped = {
			armor: {
				label: "EH.Item.Types.Armor[other]",
				items: []
			},
			weapons: {
				label: "EH.Item.Types.Weapon[other]",
				items: []
			}
		};

		context.features = {
			archetype: {
				label: "EH.Item.Types.Archetype[one]",
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
				label: "EH.Item.Types.Class[one]",
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
				label: "EH.Item.Types.Background[one]",
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
				label: "EH.Item.Types.Profession[one]",
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
				label: "EH.Item.Types.Feat[other]",
				items: [],
				create: [
					{ dataset: {type: "feat"} }
				]
			}
		};

		const formatter = new Intl.ListFormat(game.i18n.lang, {style: "short", type: "conjunction"});
		context.inventory = {
			armor: {
				label: "EH.Item.Types.Armor[other]",
				items: [],
				options: { equippable: true },
				create: [
					{
						label: "EH.Item.Types.Armor[one]",
						icon: "artwork/svg/equipment/armor.svg",
						dataset: {type: "armor"}
					}
				]
			},
			weapons: {
				label: "EH.Item.Types.Weapon[other]",
				items: [],
				options: { equippable: true },
				create: [
					{
						label: "EH.Item.Types.Weapon[one]",
						icon: "artwork/svg/equipment/weapon.svg",
						dataset: {type: "weapon"}
					}
				]
			},
			ammunitionExplosives: {
				label: formatter.format([
					game.i18n.localize("EH.Item.Types.Ammunition[other]"),
					game.i18n.localize("EH.Item.Types.Explosive[other]")
				]),
				items: [],
				create: [
					{
						label: "EH.Item.Types.Ammunition[one]",
						icon: "artwork/svg/equipment/ammunition.svg",
						dataset: {type: "ammunition"}
					},
					{
						label: "EH.Item.Types.Explosive[one]",
						icon: "artwork/svg/equipment/explosive.svg",
						dataset: {type: "explosive"}
					}
				]
			},
			gear: {
				label: "EH.Item.Types.Gear[other]",
				items: [],
				create: [
					{
						label: "EH.Item.Types.Gear[one]",
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
				case "specialfeature":
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
		const id = event.currentTarget.closest("[data-item-id]")?.dataset.itemId;
		const item = id ? this.actor.items.get(id) : null;
		switch (event.currentTarget.dataset.type) {
			case "add":
				return console.log("ADD ITEM");
			case "edit":
				return item?.sheet.render(true);
			case "equip":
				const equippedItems = this.actor.system.items.equipped;
				if ( equippedItems.has(id) ) equippedItems.delete(id);
				else equippedItems.add(id);
				// TODO: Coercing this to array won't be necessary in V11
				return this.actor.update({"system.items.equipped": Array.from(equippedItems)});
			case "expand":
				return console.log("EXPAND ITEM", id);
			case "delete":
				const manager = AdvancementManager.forDeletedItem(this.actor, id);
				if ( manager.steps.length ) {
					try {
						if ( await AdvancementConfirmationDialog.forDelete(item) ) return manager.render(true);
					} catch(err) { return; }
				}
				return item.deleteDialog();
			default:
				return console.warn(`Invalid item action type clicked ${event.currentTarget.dataset.type}.`);
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
				return console.log("Initiative rolls not yet implemented");
			case "skill":
				return this.actor.rollSkill(key);
			default:
				return console.warn(`Invalid roll type clicked ${type}.`);
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Drag & Drop                              */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

}
