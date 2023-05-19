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
			alternateTypes: new foundry.data.fields.SetField(new foundry.data.fields.StringField(), {
				label: ""
			})
		};
	}

}
