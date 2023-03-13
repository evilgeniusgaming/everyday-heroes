import BaseRoll from "./base-roll.mjs";

/**
 * Damage roll configuration data.
 *
 * @typedef {BaseRollConfiguration} DamageRollConfiguration
 * @property {DamageRollOptions} [options] - Options passed through to the roll.
 */

/**
 * Options that describe a challenge roll.
 *
 * @typedef {object} DamageRollOptions
 * @property {boolean} [critical] - Does this roll do critical damage?
 */

/**
 * Roll used for damage with helpers for calculating critical damage.
 * @param {string} formula - The formula used to construct the roll.
 * @param {object} data - The roll data used to resolve the formula.
 * @param {DamageRollOptions} options - Additional options that describe the challenge roll.
 */
export default class DamageRoll extends BaseRoll {

}
