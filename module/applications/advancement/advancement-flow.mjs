/**
 * Base class for the advancement interface displayed by the advancement prompt that should be subclassed by
 * individual advancement types.
 *
 * @param {ItemEH} item - Item to which the advancement belongs.
 * @param {string} advancementId - ID of the advancement this flow modifies.
 * @param {number} level - Level for which to configure this flow.
 * @param {object} [options={}] - Application rendering options.
 */
export default class AdvancementFlow extends FormApplication { }
