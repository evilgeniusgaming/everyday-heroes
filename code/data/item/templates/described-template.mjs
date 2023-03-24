/**
 * Data model template with item description.
 *
 * @property {object} description
 * @property {string} description.value - Full item description.
 * @property {string} description.chat - Description displayed in chat messages.
 * @property {string} description.source - Which book did this item appear?
 * @mixin
 */
export default class DescribedTemplate extends foundry.abstract.DataModel {

	static defineSchema() {
		return {
			description: new foundry.data.fields.SchemaField({
				value: new foundry.data.fields.HTMLField({nullable: true, label: ""}),
				chat: new foundry.data.fields.HTMLField({nullable: true, label: ""}),
				source: new foundry.data.fields.StringField({label: ""})
			})
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Helpers                                  */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Description of this item that will appear on the details tab of NPC sheets.
	 * @returns {Promise<string>}
	 */
	async npcDescription() {
		return await TextEditor.enrichHTML(this.description.value ?? "", {
			secrets: this.parent?.isOwner, rollData: this.parent?.getRollData() ?? {}, async: true, relativeTo: this.parent
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Label that will appear on the details tab of NPC sheets.
	 * @returns {Promise<string>}
	 */
	async npcLabel() {
		return `<a data-action="roll-item" data-type="activate">${this.parent.name}</a>`;
	}
}
