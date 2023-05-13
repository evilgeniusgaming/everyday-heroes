import SystemDataModel from "../abstract/system-data-model.mjs";
import IdentifierField from "../fields/identifier-field.mjs";
import AdvancementTemplate from "./templates/advancement-template.mjs";
import DescribedTemplate from "./templates/described-template.mjs";

/**
 * Data definition for Archetype items.
 * @mixes {@link AdvancementTemplate}
 * @mixes {@link DescribedTemplate}
 */
export default class ArchetypeData extends SystemDataModel.mixin(DescribedTemplate, AdvancementTemplate) {

	static get metadata() {
		return {
			type: "archetype",
			category: "concept",
			localization: "EH.Item.Type.Archetype",
			icon: "fa-solid fa-landmark",
			image: "systems/everyday-heroes/artwork/svg/items/archetype.svg",
			register: true
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			identifier: new foundry.data.fields.SchemaField({
				value: new IdentifierField({label: "Identifier.Label"})
			})
		});
	}

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
