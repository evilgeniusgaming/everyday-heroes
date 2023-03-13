import MappingField from "../fields/mapping-field.mjs";

/**
 * Configuration data for the Item Grant advancement.
 *
 * @property {string[]} pool - Array of item UUIDs that will be granted.
 */
export class ItemGrantConfigurationData extends foundry.abstract.DataModel {
	static defineSchema() {
		return {
			pool: new foundry.data.fields.ArrayField(new foundry.data.fields.StringField(), {
				required: true, label: "DOCUMENT.Items"
			})
		};
	}
}

/**
 * Value data for the Item Grant advancement.
 *
 * @property {Object<string, string>} granted - IDs of the granted items on the actor and their origin UUID.
 */
export class ItemGrantValueData extends foundry.abstract.DataModel {
	static defineSchema() {
		return {
			added: new MappingField(new foundry.data.fields.StringField(), {required: false, initial: undefined})
		};
	}
}
