import { TraitConfigurationData } from "./trait-data.mjs";

/**
 * Configuration data for the Ability Score Improvement advancement type.
 *
 * @property {Set<string>} fixed - Abilities that automatically get a +1.
 * @property {number} points - Number of points that can be assigned to the specified scores.
 * @property {Set<string>} choices - Abilities to which the player can choose to assign points.
 */
export class ASIConfigurationData extends TraitConfigurationData {
	static defineSchema() {
		const schema = super.defineSchema();
		delete schema.type;
		delete schema.expertise;
		return schema;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Type of trait to modify.
	 * @type {string}
	 */
	get type() {
		return "asi";
	}
}
