import MappingField from "../fields/mapping-field.mjs";
import RollField from "../fields/roll-field.mjs";

const { ArrayField, NumberField, SchemaField, StringField } = foundry.data.fields;

/**
 * Configuration data for an ability score roll.
 *
 * @typedef {object} AbilityScoreRollConfigurationData
 * @property {string} formula - Base rolling formula.
 * @property {number} bonus - Flat numerical bonus added to the roll.
 */

/**
 * Configuration data for the Ability Score advancement type.
 *
 * @property {Record<string, number>} maximums - Maximum score for all abilities.
 * @property {object} pointBuy
 * @property {number} pointBuy.points - Points available to spend.
 * @property {number} pointBuy.maximum - Maximum score during point buy.
 * @property {AbilityScoreRollConfigurationData[]} rolling - Configuration for ability score rolls.
 * @property {number[]} startingArray - Scores available as part of the starting array.
 */
export class AbilityScoresConfigurationData extends foundry.abstract.DataModel {
	static defineSchema() {
		return {
			maximums: new MappingField(
				new NumberField({ initial: 20, integer: true, positive: true }),
				{ initialKeys: CONFIG.EverydayHeroes.abilities, prepareKeys: true }
			),
			pointBuy: new SchemaField({
				points: new NumberField({ integer: true, positive: true }),
				maximum: new NumberField({ initial: 15, integer: true, positive: true })
			}),
			rolling: new ArrayField(new SchemaField({
				formula: new StringField({ initial: "4d6kh" }),
				bonus: new NumberField({ integer: true })
			})),
			startingArray: new ArrayField(new NumberField({ integer: true, positive: true }))
		};
	}
}

/**
 * Value data for the Ability Scores advancement type.
 *
 * @property {string} method - Ability score assignment method used.
 * @property {Roll[]} rolls - Ability score rolls performed.
 * @property {Record<string, number>} assignments - Data necessary to determine final ability scores depending on
 *                                                  assignment method. For starting array it is the index of the
 *                                                  assigned value in the array, for rolling it is the index of the
 *                                                  assigned roll, and for point buy it is the final ability score.
 */
export class AbilityScoresValueData extends foundry.abstract.DataModel {
	static defineSchema() {
		return {
			method: new StringField(),
			rolls: new ArrayField(new RollField({ nullable: true })),
			assignments: new MappingField(new NumberField({ min: 0, integer: true }))
		};
	}
}
