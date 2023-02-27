export default class HeroSheetEH extends ActorSheet {
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["everyday-heroes", "sheet", "actor", "hero"],
			template: "systems/everyday-heroes/templates/actor/hero-sheet.hbs",
			tabs: [{navSelector: 'nav[data-group="primary"]', contentSelector: "main", initial: "details"}],
			width: 820,
			height: 720
		});
	}

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

		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare the items for display on the sheet.
	 * @param {object} context - Context object for rendering the sheet. **Will be mutated.**
	 */
	prepareItems(context) {
		context.itemContext = {};

		context.features = {
			archetype: {
				label: "EH.Item.Types.Archetype[one]",
				primary: {
					item: null,
					dataset: {type: "archetype"}
				},
				items: [],
				dataset: {type: "talent", "system.type.value": "archetype"}
			},
			class: {
				label: "EH.Item.Types.Class[one]",
				primary: {
					item: null,
					dataset: {type: "class"}
				},
				items: [],
				dataset: {type: "talent", "system.type.value": "class"}
			},
			background: {
				label: "EH.Item.Types.Background[one]",
				primary: {
					item: null,
					dataset: {type: "background"}
				},
				items: [],
				dataset: {type: "talent", "system.type.value": "background"}
			},
			profession: {
				label: "EH.Item.Types.Profession[one]",
				primary: {
					item: null,
					dataset: {type: "profession"}
				},
				items: [],
				dataset: {type: "talent", "system.type.value": "profession"}
			},
			feats: {
				label: "EH.Item.Types.Feat[other]",
				items: [],
				dataset: {type: "feat"}
			}
		};

		for ( const item of context.actor.items ) {
			// TODO: Add additional item context here
			// const ctx = context.itemContext[item.id] ??= {};

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
			}
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Action Handlers                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	activateListeners(jQuery) {
		super.activateListeners(jQuery);
		const html = jQuery[0];

		// Roll Action Listeners
		for ( const element of html.querySelectorAll('[data-action="roll"') ) {
			element.addEventListener("click", this._onRollAction.bind(this));
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
		switch (event.target.dataset.type) {
			case "ability":
				return this.actor.rollAbility(event.target.dataset.key);
			case "ability-check":
				return this.actor.rollAbilityCheck(event.target.dataset.key);
			case "ability-save":
				return this.actor.rollAbilitySave(event.target.dataset.key);
			case "death-save":
				return this.actor.rollDeathSave();
			case "hit-die":
				return this.actor.rollHitDie();
			case "initiative":
				return console.log("Initiative rolls not yet implemented");
			case "skill":
				return this.actor.rollSkill(event.target.dataset.key);
			default:
				return console.log(`Invalid roll type clicked ${event.target.dataset.type}.`);
		}
	}

}
