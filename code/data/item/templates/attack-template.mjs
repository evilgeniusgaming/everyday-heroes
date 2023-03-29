import { simplifyBonus } from "../../../utils.mjs";

/**
 * Data model template for items that make attacks. Does not introduce any fields of its own, but provides
 * some data preparation methods and helpers.
 *
 * @mixin
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
		const rollData = this.parent?.getRollData() ?? {};
		return (rollData.abilities?.[this.attackAbility]?.mod ?? 0)
			+ simplifyBonus(this.proficiency?.term, rollData)
			+ simplifyBonus(this.parent?.actor?.system.bonuses?.attack?.all, rollData);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Tooltip displayed for attack button.
	 * @type {string}
	 */
	get attackTooltip() {
		return game.i18n.format("EH.Action.Roll", { type: game.i18n.localize("EH.Weapon.Action.AttackGeneric") });
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
	 * The number needed to roll on a dice to be considered a critical hit.
	 * @type {number|null}
	 */
	get criticalThreshold() {
		return null;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Can attack rolls be performed by this Item?
	 * @type {boolean}
	 */
	get hasAttack() {
		return true;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Ability modifier used for melee attacks.
	 * @type {string}
	 */
	get meleeAbility() {
		return this.parent.actor?.system.bestAbility?.(new Set([
			CONFIG.EverydayHeroes.defaultAbilities.melee,
			...this.parent.actor?.system.overrides?.ability?.melee ?? []
		])) ?? CONFIG.EverydayHeroes.defaultAbilities.melee;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Ability modifier used for ranged attacks.
	 * @type {string}
	 */
	get rangedAbility() {
		return this.parent.actor?.system.bestAbility?.(new Set([
			CONFIG.EverydayHeroes.defaultAbilities.ranged,
			...this.parent.actor?.system.overrides?.ability?.ranged ?? []
		])) ?? CONFIG.EverydayHeroes.defaultAbilities.ranged;
	}
}
