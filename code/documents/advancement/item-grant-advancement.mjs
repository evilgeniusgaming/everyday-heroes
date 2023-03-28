import ItemGrantConfig from "../../applications/advancement/item-grant-config.mjs";
import ItemGrantFlow from "../../applications/advancement/item-grant-flow.mjs";
import { ItemGrantConfigurationData, ItemGrantValueData } from "../../data/advancement/item-grant-data.mjs";
import Advancement from "./advancement.mjs";

/**
 * Advancement that automatically grants one or more items to the player. Presents the player with the option of
 * skipping any or all of the items.
 */
export default class ItemGrantAdvancement extends Advancement {

	static get metadata() {
		return foundry.utils.mergeObject(super.metadata, {
			dataModels: {
				configuration: ItemGrantConfigurationData,
				value: ItemGrantValueData
			},
			order: 40,
			icon: "systems/everyday-heroes/artwork/svg/advancement/item-grant.svg",
			title: game.i18n.localize("EH.Advancement.ItemGrant.Title"),
			hint: game.i18n.localize("EH.Advancement.ItemGrant.Hint"),
			validItemTypes: new Set(["archetype", "class", "background", "profession"]),
			apps: {
				config: ItemGrantConfig,
				flow: ItemGrantFlow
			}
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * The item types that are supported in Item Grant.
	 * @type {Set<string>}
	 */
	static VALID_TYPES = new Set([
		"specialFeature", "talent", "plan", "trick", "armor", "weapon", "ammunition", "explosive", "gear"
	]);

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Display Methods                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	configuredForLevel(level) {
		return !foundry.utils.isEmpty(this.value);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	summaryForLevel(level, { configMode=false }={}) {
		// Link to compendium items
		if ( !this.value.added || configMode ) {
			return this.configuration.pool.reduce((html, uuid) => html + EverydayHeroes.utils.linkForUUID(uuid), "");
		}

		// Link to items on the actor
		else {
			return Object.keys(this.value.added).map(id => {
				const item = this.actor.items.get(id);
				return item?.toAnchor({classes: ["content-link"]}).outerHTML ?? "";
			}).join("");
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Application Methods                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Location where the added items are stored for the specified level.
	 * @param {number} level - Level being advanced.
	 * @returns {string}
	 */
	storagePath(level) {
		return "value.added";
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async apply(level, data) {
		const items = [];
		const updates = {};
		for ( const [uuid, selected] of Object.entries(data.selected) ) {
			if ( !selected ) continue;

			let itemData = data.retained?.[uuid];
			if ( !itemData ) {
				const source = await fromUuid(uuid);
				if ( !source ) continue;
				itemData = source.clone({
					_id: foundry.utils.randomID(),
					"flags.everyday-heroes.sourceId": uuid,
					"flags.everyday-heroes.advancementOrigin": `${this.item.id}.${this.id}`
				}, {keepId: true}).toObject();
			}

			items.push(itemData);
			updates[itemData._id] = uuid;
		}
		this.actor.updateSource({items});
		this.updateSource({[this.storagePath(level)]: updates});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	restore(level, data) {
		const updates = {};
		for ( const item of data.added ) {
			this.actor.updateSource({items: [item]});
			updates[item._id] = item.flags["everyday-heroes"]?.sourceId;
		}
		this.updateSource({[this.storagePath(level)]: updates});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	reverse(level) {
		const added = [];
		const keyPath = this.storagePath(level);
		for ( const id of Object.keys(foundry.utils.getProperty(this, keyPath) ?? {}) ) {
			const item = this.actor.items.get(id);
			if ( item ) added.push(item.toObject());
			this.actor.items.delete(id);
		}
		this.updateSource({[keyPath.replace(/\.([\w\d]+)$/, ".-=$1")]: null});
		return { added };
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Verify that the provided item can be used with this advancement based on the configuration.
	 * @param {ItemEH} item - Item that needs to be tested.
	 * @param {object} config
	 * @param {boolean} [config.strict=true] - Should an error be thrown when an invalid type is encountered?
	 * @returns {boolean} - Is this type valid?
	 * @throws An error if the item is invalid and strict is `true`.
	 */
	_validateItemType(item, { strict=true }={}) {
		if ( this.constructor.VALID_TYPES.has(item.type) ) return true;
		const type = game.i18n.localize(CONFIG.Item.typeLabels[item.type]);
		if ( strict ) throw new Error(game.i18n.format("EH.Advancement.Config.Warning.Invalid", {type}));
		return false;
	}
}
