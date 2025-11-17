import CreateDocumentDialog from "../applications/create-document-dialog.mjs";

/**
 * Mixin used to share some logic between Actor & Item documents.
 * @type {function(Class)}
 * @mixin
 */
export const DocumentMixin = Base => class extends Base {

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Enrichment                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @inheritDoc */
	async _createInlineEmbed(content, config={}, options={}) {
		const embed = await super._createInlineEmbed(content, config, options);
		if ( config.label && embed.children[0] ) {
			const firstElement = embed.children[0];
			firstElement.innerHTML = `<strong>${config.label}.</strong> ${firstElement.innerHTML}`;
		}
		return embed;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Importing and Exporting                  */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @override */
	static async createDialog(data={}, createOptions={}, dialogOptions={}) {
		CreateDocumentDialog.migrateOptions(createOptions, dialogOptions);
		return CreateDocumentDialog.prompt(this, data, createOptions, dialogOptions);
	}
};
