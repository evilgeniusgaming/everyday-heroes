import FormulaField from "../fields/formula-field.mjs";
import DamageData from "./damage-data.mjs";

/**
 * Data model for a weapon's supplemental damage.
 *
 * @property {string} bonus - Additional bonus applied.
 */
export default class SupplementalDamageData extends DamageData {

	static defineSchema() {
		return {
			...super.defineSchema(),
			bonus: new FormulaField({label: "EH.Weapon.Bonus.Damage.Label"})
		};
	}

}
