import FormulaField from "../../fields/formula-field.mjs";
import { simplifyBonus } from "../../../utils.mjs";
import Proficiency from "../../../documents/proficiency.mjs";

/**
 * Data model template for actors that have initiative.
 * @mixin
 *
 * @property {object} attributes
 * @property {object} attributes.initiative
 * @property {string} attributes.initiative.bonus - Bonus added to initiative rolls.
 * @property {object} overrides
 * @property {object} overrides.ability
 * @property {Set<string>} overrides.ability.initiative - Abilities to consider in place of `dex` for initiative.
 */
export default class InitiativeTemplate extends foundry.abstract.DataModel {
	static defineSchema() {
		return {
			attributes: new foundry.data.fields.SchemaField({
				initiative: new foundry.data.fields.SchemaField({
					bonus: new FormulaField({label: "EH.Initiative.Bonus.Label"})
				}, {label: "EH.Initiative.Label"})
			}),
			overrides: new foundry.data.fields.SchemaField({
				ability: new foundry.data.fields.SchemaField({
					initiative: new foundry.data.fields.SetField(new foundry.data.fields.StringField(), {
						label: "EH.Override.Ability.Initiative.Label"
					})
				}, {label: "EH.Override.Ability.Label", hint: "EH.Override.Ability.Hint"})
			}, {label: "EH.Override.Label"})
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedInitiative() {
		const rollData = this.parent.getRollData();
		const init = this.attributes.initiative;

		init.ability = this.bestAbility?.(new Set([
			CONFIG.EverydayHeroes.defaultAbilities.initiative,
			...this.overrides.ability.initiative
		])) ?? CONFIG.EverydayHeroes.defaultAbilities.initiative;
		const ability = this.abilities?.[init.ability] ?? {};

		init.prof = new Proficiency(this.attributes?.prof ?? 0, 0);
		const initBonus = simplifyBonus(init.bonus, rollData);
		const abilityBonus = simplifyBonus(ability.bonuses?.check, rollData);
		const globalBonus = simplifyBonus(this.bonuses?.ability?.check, rollData);
		init.mod = (ability.mod ?? 0) + initBonus + abilityBonus + globalBonus;
	}
}
