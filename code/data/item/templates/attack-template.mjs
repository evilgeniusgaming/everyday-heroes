/**
 * Data model template for items that make attacks. Does not introduce any fields of its own, but provides
 * some data preparation methods and helpers.
 */
export default class AttackTemplate {

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Ability modifier used by this Item when making attacks, taking mode into account if it has one.
	 * @returns {string|null}
	 */
	get attackAbility() {
		return null;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Icon display on the attack button.
	 * @type {string}
	 */
	get attackIcon() {
		return "systems/everyday-heroes/artwork/svg/action/attack-melee.svg";
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * The simplified attack modifier for this Item, taking mode into account if it has one.
	 * @type {number}
	 */
	get attackMod() {
		const ability = this.parent?.actor?.system.abilities?.[this.attackAbility];
		// TODO: Take flat bonuses into account
		return (ability?.mod ?? 0) + (Number.isNumeric(this.proficiency?.term) ? this.proficiency.flat : 0);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Tooltip displayed for attack button.
	 * @type {string}
	 */
	get attackTooltip() {
		return game.i18n.format("EH.Action.Roll", { type: game.i18n.localize("EH.Weapon.Action.AttackGeneric.Label") });
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Is it currently possible to attack with this Item?
	 * @type {boolean}
	 */
	get canAttack() {
		return true;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Can attack rolls be performed by this Item?
	 * @type {boolean}
	 */
	get hasAttack() {
		return true;
	}
}
