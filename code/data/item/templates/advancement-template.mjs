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

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareBaseScaleValues() {
		const scale = this.scale ??= {};
		const level = this.parent?.actor?.system.details?.level || this.parent?.actor?.system.details?.cr;
		if ( !level ) return;
		const actorScale = this.parent.actor.system.scale ??= {};
		for ( const advancement of this.advancement.byType("ScaleValue") ) {
			scale[advancement.identifier] = actorScale[advancement.identifier] = advancement.valueForLevel(level);
		}
		const resources = this.parent.actor.system.resources ??= {};
		for ( const advancement of this.advancement.byType("Resource") ) {
			const resource = resources[advancement.identifier] ??= {};
			resource.advancement = advancement;
			resource.scale = advancement.valueForLevel(level);
			scale[advancement.identifier] = actorScale[advancement.identifier] = advancement.valueForLevel(level);
		}
	}
}
