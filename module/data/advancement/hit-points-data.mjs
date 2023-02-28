import MappingField from "../fields/mapping-field.mjs";

/**
 * Configuration data for the Hit Points advancement.
 *
 * @property {string} hitDie - Denomination of hit die available as defined in `CONFIG.EverydayHeroes.hitDieTypes`.
 */
export class HitPointsConfigurationData extends foundry.abstract.DataModel {
	static defineSchema() {
		return {
			hitDie: new foundry.data.fields.StringField({
				blank: false, initial: "d6", label: "EH.HitDice.Label[one]",
				validate: v => /d\d+/.test(v), validationError: "must be a dice value in the format d#"
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
