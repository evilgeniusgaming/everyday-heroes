import SystemDataModel from "../abstract/system-data-model.mjs";
import AdvancementTemplate from "./templates/advancement-template.mjs";
import DescribedTemplate from "./templates/described-template.mjs";

/**
 * Data definition for Archetype items.
 * @mixes {@link AdvancementTemplate}
 * @mixes {@link DescribedTemplate}
 */
export default class ArchetypeData extends SystemDataModel.mixin(DescribedTemplate, AdvancementTemplate) {

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedHitDie() {
		const hpAdvancement = this.advancement.byType("HitPoints")?.[0];
		this.hitDie = hpAdvancement.hitDieValue;
	}
}
