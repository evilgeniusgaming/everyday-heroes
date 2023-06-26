import { simplifyBonus } from "../../utils.mjs";
import FormulaField from "../fields/formula-field.mjs";
import DamageData from "./damage-data.mjs";

/**
 * Data model for a weapon's supplemental damage.
 *
 * @property {string} bonus - Additional bonus applied.
 * @property {number|null} penetrationValue - Penetration value for this damage group.
 * @property {boolean} customPV - Whether this penetration value should be used, or should this damage group inherit
 *                                its PV from the base damage.
 */
export default class SupplementalDamageData extends DamageData {

	static defineSchema() {
		return {
			...super.defineSchema(),
			bonus: new FormulaField({label: "EH.Weapon.Bonus.Damage.Label"}),
			penetrationValue: new foundry.data.fields.NumberField({
				required: false, min: 0, integer: true,
				label: "EH.Equipment.Trait.PenetrationValue.Label", hint: "EH.Equipment.Trait.PenetrationValue.Hint"
			}),
			customPV: new foundry.data.fields.BooleanField({
				required: false, label: "EH.Equipment.Trait.SupplementalDamage.CustomPV"
			})
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Helper Methods                           */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	average(mod=0) {
		mod += simplifyBonus(this.bonus, this.parent?.parent?.getRollData());
		return super.average(mod);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	formula(mod=0) {
		mod += simplifyBonus(this.bonus, this.parent?.parent?.getRollData());
		return super.formula(mod);
	}
}
