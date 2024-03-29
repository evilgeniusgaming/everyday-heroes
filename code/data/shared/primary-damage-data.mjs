import DamageData from "./damage-data.mjs";

/**
 * Data model for a weapon's primary damage.
 *
 * @property {Set<string>} alternateTypes - Selection of damage types if main type is set to `multiple`.
 */
export default class PrimaryDamageData extends DamageData {

	static defineSchema() {
		return {
			...super.defineSchema(),
			alternateTypes: new foundry.data.fields.SetField(new foundry.data.fields.StringField({
				suggestions: CONFIG.EverydayHeroes.damageTypes
			}), {
				label: "EH.Equipment.Trait.Damage.Types.Label", hint: "EH.Equipment.Trait.Damage.Types.Hint"
			})
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Migrations                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static migrateData(source) {
		source.alternateTypes ??= [];
		return super.migrateData(source);
	}

}
