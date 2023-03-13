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

	prepareDerivedDefense() {
		this.defense ??= {};
		const level = this.parent?.actor?.system.details?.level;
		const defenseAdvancement = this.advancement.byType("Defense")[0];
		if ( !defenseAdvancement || !level ) return;
		this.defense.abilities = defenseAdvancement.configuration.abilities;
		this.defense.bonus = defenseAdvancement.valueForLevel(level)?.value ?? 0;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedHitDie() {
		const hpAdvancement = this.advancement.byType("HitPoints")[0];
		this.hitDie = hpAdvancement?.configuration.denomination;
	}
}
