import FormulaField from "../../fields/formula-field.mjs";
import { simplifyBonus } from "../../../utils.mjs";
import Proficiency from "../../../documents/proficiency.mjs";

/**
 * Data model template for actors that have initiative.
 * @mixin
 *
 * @property {object} attributes
 * @property {object} attributes.initiative
 * @property {string} attributes.initiative.ability - Ability used when rolling initiative.
 * @property {strong} attributes.initiative.bonus - Bonus added to initiative rolls.
 */
export default class InitiativeTemplate extends foundry.abstract.DataModel {
	static defineSchema() {
		return {
			attributes: new foundry.data.fields.SchemaField({
				initiative: new foundry.data.fields.SchemaField({
					ability: new foundry.data.fields.StringField({
						initial: () => CONFIG.EverydayHeroes.defaultAbilities.initiative, label: "EH.Ability.Label[one]"
					}),
					bonus: new FormulaField({label: "EH.Initiative.Bonus.Label"})
				}, {label: "EH.Initiative.Label"})
			})
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedInitiative() {
		const rollData = this.parent.getRollData();
		const init = this.attributes.initiative;
		const abilityKey = init.ability ?? CONFIG.EverydayHeroes.defaultAbilities.initiative;
		const ability = this.abilities?.[abilityKey] ?? {};
		init.prof = new Proficiency(this.attributes?.prof ?? 0, 0);
		const initBonus = simplifyBonus(init.bonus, rollData);
		const abilityBonus = simplifyBonus(ability.bonuses?.check, rollData);
		const globalBonus = simplifyBonus(this.bonuses?.ability?.check, rollData);
		init.mod = (ability.mod ?? 0) + initBonus + abilityBonus + globalBonus;
	}
}
