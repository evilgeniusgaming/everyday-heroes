import ItemGrantAdvancement from "./item-grant-advancement.mjs";

/**
 * Custom advancement type that can grant advancements with no strain.
 */
export default class CyberneticsAdvancement extends ItemGrantAdvancement {

	static get metadata() {
		return foundry.utils.mergeObject(super.metadata, {
			order: 45,
			title: game.i18n.localize("EH.Advancement.Cybernetics.Title"),
			hint: game.i18n.localize("EH.Advancement.Cybernetics.Hint")
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Application Methods                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @inheritDoc */
	async createItemData(uuid, options) {
		const itemData = await super.createItemData(uuid, options);
		foundry.utils.setProperty(itemData, "system.strain", 0);
		return itemData;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @override */
	_validateItemType(item, { strict=true }={}) {
		if ( item.system.metadata.type === "cybernetics" ) return true;
		return super._validateItemType(item, { strict });
	}
}
