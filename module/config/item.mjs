import { preLocalize } from "./utils.mjs";

/**
 * Configuration data for equipment types.
 *
 * @typedef {object} EquipmentTypeConfiguration
 * @property {string} label       Localized label.
 * @property {string} [requires]  Key of another equipment type that the player must be proficient in to gain
 *                                proficiency in this type.
 */

/**
 * Set of Equipment Types that can be selected & player can gain proficiency in.
 * @enum {EquipmentTypeConfiguration}
 */
export const equipmentTypes = {
  basic: {
    label: "EH.Equipment.Types.Basic.Label"
  },
  advanced: {
    label: "EH.Equipment.Types.Advanced.Label",
    requires: "basic"
  },
  historical: {
    label: "EH.Equipment.Types.Historical.Label",
    requires: "basic"
  },
  improvised: {
    label: "EH.Equipment.Types.Improvised.Label",
    requires: "basic"
  },
  military: {
    label: "EH.Equipment.Types.Military.Label",
    requires: "advanced"
  }
};
preLocalize("equipmentTypes", { key: "label" });
