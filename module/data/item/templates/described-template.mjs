/**
 * Data model template with item description.
 *
 * @property {object} description
 * @property {string} description.value - Full item description.
 * @property {string} description.chat - Description displayed in chat messages.
 * @mixin
 */
export default class DescribedTemplate extends foundry.abstract.DataModel {
	static defineSchema() {
		return {
			description: new foundry.data.fields.SchemaField({
				value: new foundry.data.fields.HTMLField({nullable: true, label: ""}),
				chat: new foundry.data.fields.HTMLField({nullable: true, label: ""})
			})
		};
	}
}
