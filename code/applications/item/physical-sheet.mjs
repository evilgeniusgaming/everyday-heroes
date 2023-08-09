import BasePhysicalSheet from "./base-physical-sheet.mjs";

/**
 * Sheet that represents Armor, Weapon, Explosive, and Gear items.
 */
export default class PhysicalSheet extends BasePhysicalSheet {

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["everyday-heroes", "sheet", "physical", "item"],
			template: "systems/everyday-heroes/templates/item/physical-sheet.hbs"
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Context Preparation                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async getData(options) {
		const context = await super.getData(options);

		if ( ["npcExplosive", "npcWeapon"].includes(this.item.type) ) {
			context.activationCosts = CONFIG.EverydayHeroes.actionTypesWeapon;
		}

		context.diceSteps = Object.fromEntries(CONFIG.EverydayHeroes.diceSteps.map(n => [n, `d${n}`]));

		context.diceMod = { count: [], denomination: [] };
		const numberFormatter = new Intl.NumberFormat(game.i18n.lang, { signDisplay: "exceptZero" });
		const pluralRule = new Intl.PluralRules(game.i18n.lang);
		for ( let i = -4; i <= 4; i++ ) {
			const number = numberFormatter.format(i);
			const pr = pluralRule.select(i);
			context.diceMod.count.push({
				name: i, label: game.i18n.format(`EH.Dice.Modification.Count[${pr}]`, { number })
			});
			context.diceMod.denomination.push({
				name: i, label: game.i18n.format(`EH.Dice.Modification.Denomination[${pr}]`, { number })
			});
		}

		context.lengthUnits = {};
		const isTitanic = this.item.system.isTitanic;
		if ( !isTitanic ) Object.assign(context.lengthUnits, CONFIG.EverydayHeroes.lengthUnits);
		if ( (isTitanic === true) || (isTitanic === undefined) ) context.lengthUnits.space = {
			label: game.i18n.localize("EH.Measurement.Length.Space.Label[other]")
		};

		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Action Handlers                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	activateListeners(jQuery) {
		super.activateListeners(jQuery);
		const html = jQuery[0];

		// Damage Actions
		for ( const element of html.querySelectorAll('[data-action="damage"]') ) {
			element.addEventListener("click", this._onDamageAction.bind(this));
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle clicking one of the supplemental damage action buttons.
	 * @param {ClickEvent} event - The triggering click event.
	 * @returns {Promise}
	 */
	_onDamageAction(event) {
		event.preventDefault();
		const type = event.currentTarget.dataset.type;
		const damageCollection = this.item.system.supplementalDamage;
		if ( !damageCollection ) return console.warn(
			"Everyday Heroes | Damage action does not work on types without supplemental damage."
		);

		switch (type) {
			case "add":
				damageCollection.push({});
				break;
			case "remove":
				const index = event.target.closest("[data-index]").dataset.index;
				damageCollection.splice(index, 1);
				break;
			default:
				return console.warn(`Everyday Heroes | Invalid damage action type clicked ${type}.`);
		}
		return this.item.update({"system.supplementalDamage": damageCollection});
	}
}
