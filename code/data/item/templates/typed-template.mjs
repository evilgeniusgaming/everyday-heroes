/**
 * Data model template with item a type.
 *
 * @property {object} type
 * @property {string} type.value - Type of the item.
 * @mixin
 */
export default class TypedTemplate extends foundry.abstract.DataModel {

	static defineSchema() {
		return {
			type: new foundry.data.fields.SchemaField({
				value: new foundry.data.fields.StringField({initial: "", label: "EH.Item.Type.Label"})
			}, {label: "EH.Item.Type.Label"})
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Types that can be used for `type.value`.
	 * @type {Object<string, LabeledConfiguration>|null}
	 */
	get types() {
		return foundry.utils.getProperty(
			CONFIG.EverydayHeroes, `${this.constructor.metadata.variant ?? this.constructor.metadata.type}Types`
		);
	}
}
