import { AdvancementField } from "../../fields/advancement-field.mjs";
import TypeField from "../../fields/type-field.mjs";

/**
 * Data model template for items that include advancements.
 *
 * @property {Advancement[]} advancement - Advancement collection.
 * @mixin
 */
export default class AdvancementTemplate extends foundry.abstract.DataModel {

	/**
	 * Flag indicating this item supports advancements.
	 */
	static hasAdvancement = true;

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		return {
			advancement: new AdvancementField(
				new TypeField({
					determineType: value => value._type,
					modelLookup: type => CONFIG.EverydayHeroes.advancementTypes[type] ?? null
				}),
				{label: "EH.Advancement.Title[other]"}
			)
		};
	}
}
