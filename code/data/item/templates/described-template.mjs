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
				value: new foundry.data.fields.HTMLField({
					nullable: true, label: "EH.Item.Description.Label", hint: "EH.Item.Description.Hint"
				}),
				chat: new foundry.data.fields.HTMLField({
					nullable: true, label: "EH.Item.Description.Chat.Label", hint: "EH.Item.Description.Chat.Hint"
				}),
				source: new foundry.data.fields.StringField({label: "EH.Item.Source.Label", hint: "EH.Item.Source.Hint"})
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
		return await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.description.value ?? "", {
			secrets: this.parent?.isOwner, rollData: this.getRollData(), async: true, relativeTo: this.parent
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
