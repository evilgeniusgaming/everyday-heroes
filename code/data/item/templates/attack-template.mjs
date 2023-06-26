import { simplifyBonus } from "../../../utils.mjs";

/**
 * Data model template for items that make attacks.
 *
 * @property {object} overrides
 * @property {object} overrides.ability
 * @property {string} overrides.ability.attack - Ability used when making an attack.
 * @mixin
 */
export default class AttackTemplate extends foundry.abstract.DataModel {

	static defineSchema() {
		return {
			overrides: new foundry.data.fields.SchemaField({
				ability: new foundry.data.fields.SchemaField({
					attack: new foundry.data.fields.StringField({label: "EH.Weapon.Overrides.Ability.Attack.Label"})
				})
			}, {label: "EH.Override.Label"})
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Ability modifier used by this Item when making attacks, taking mode into account if it has one.
	 * @returns {string|null}
	 */
	get attackAbility() {
		if ( this.overrides.ability.attack === "none" ) return null;
		return this.overrides.ability.attack ?? null;
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
		const rollData = this.getRollData();
		return (rollData.abilities?.[this.attackAbility]?.mod ?? 0)
			+ simplifyBonus(this.proficiency?.term, rollData)
			+ simplifyBonus(this.user?.system.bonuses?.attack?.all, rollData);
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
		return this.user?.system.bestAbility?.(new Set([
			CONFIG.EverydayHeroes.defaultAbilities.melee,
			...this.user?.system.overrides?.ability?.melee ?? []
		])) ?? CONFIG.EverydayHeroes.defaultAbilities.melee;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Ability modifier used for ranged attacks.
	 * @type {string}
	 */
	get rangedAbility() {
		return this.user?.system.bestAbility?.(new Set([
			CONFIG.EverydayHeroes.defaultAbilities.ranged,
			...this.user?.system.overrides?.ability?.ranged ?? []
		])) ?? CONFIG.EverydayHeroes.defaultAbilities.ranged;
	}
}
