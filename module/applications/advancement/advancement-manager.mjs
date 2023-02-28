import Advancement from "../../documents/advancement/advancement.mjs";

/**
 * Internal type used to manage each step within the advancement process.
 *
 * @typedef {object} AdvancementStep
 * @property {string} type                Step type from "forward", "reverse", "restore", or "delete".
 * @property {AdvancementFlow} [flow]     Flow object for the advancement being applied by this step.
 * @property {ItemEH} [item]              For "delete" steps only, the item to be removed.
 * @property {boolean} [automatic=false]  Should the manager attempt to apply this step without user interaction?
 */

/**
 * Application for controlling the advancement workflow and displaying the interface.
 *
 * @param {ActorEH} actor - Actor on which this advancement is being performed.
 * @param {object} [options={}] - Additional application options.
 */
export default class AdvancementManager extends Application { }
