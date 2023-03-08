import MappingField from "../fields/mapping-field.mjs";

/**
 * Configuration data for the Hit Points advancement.
 *
 * @property {string} denomination - Size of hit die available as defined in `CONFIG.EverydayHeroes.diceSteps`.
 */
export class HitPointsConfigurationData extends foundry.abstract.DataModel {
	static defineSchema() {
		return {
			denomination: new foundry.data.fields.NumberField({
				initial: () => CONFIG.EverydayHeroes.diceSteps[0], label: "EH.HitDice.Label[one]"
			})
		};
	}
}

/**
 * Value data for the Hit Points advancement.
 *
 * @property {Object<number, string>} granted - Hit points granted at various levels.
 */
export class HitPointsValueData extends foundry.abstract.DataModel {
	static defineSchema() {
		return {
			granted: new MappingField(new foundry.data.fields.StringField(), {required: false, initial: undefined})
		};
	}
}
