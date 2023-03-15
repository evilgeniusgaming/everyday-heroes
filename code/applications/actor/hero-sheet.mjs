import AdvancementManager from "../advancement/advancement-manager.mjs";
import BaseSheet from "./base-sheet.mjs";

/**
 * Sheet that represents a Hero actor.
 */
export default class HeroSheet extends BaseSheet {

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["everyday-heroes", "sheet", "actor", "hero"],
			template: "systems/everyday-heroes/templates/actor/hero-sheet.hbs",
			tabs: [{navSelector: 'nav[data-group="primary"]', contentSelector: "main", initial: "details"}],
			width: 820,
			height: 720,
			dragDrop: [{dragSelector: ":is(.item-list .item, .primary.item)", dropSelector: null}]
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static enrichedFields = {
		...super.enrichedFields,
		notes: "system.biography.notes"
	};

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Is the editor expanded on the biography tab.
	 * @type {boolean}
	 */
	editorExpanded = false;

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Context Preparation                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async prepareItems(context) {
		context.itemContext = {};

		context.equipped = {
			armor: {
				label: "EH.Item.Type.Armor[other]",
				items: []
			},
			weapons: {
				label: "EH.Item.Type.Weapon[other]",
				items: []
			}
		};

		context.features = {
			archetype: {
				label: "EH.Item.Type.Archetype[one]",
				primary: {
					item: null,
					dataset: {type: "archetype"}
				},
				items: [],
				create: [
					{ dataset: {type: "talent", "system.type.value": "archetype"} }
				]
			},
			class: {
				label: "EH.Item.Type.Class[one]",
				primary: {
					item: null,
					dataset: {type: "class"}
				},
				items: [],
				create: [
					{ dataset: {type: "talent", "system.type.value": "class"} }
				]
			},
			background: {
				label: "EH.Item.Type.Background[one]",
				primary: {
					item: null,
					dataset: {type: "background"}
				},
				items: [],
				create: [
					{ dataset: {type: "talent", "system.type.value": "background"} }
				]
			},
			profession: {
				label: "EH.Item.Type.Profession[one]",
				primary: {
					item: null,
					dataset: {type: "profession"}
				},
				items: [],
				create: [
					{ dataset: {type: "talent", "system.type.value": "profession"} }
				]
			},
			feats: {
				label: "EH.Item.Type.Feat[other]",
				items: [],
				create: [
					{ dataset: {type: "feat"} }
				]
			}
		};

		const formatter = new Intl.ListFormat(game.i18n.lang, {style: "short", type: "conjunction"});
		context.inventory = {
			armor: {
				label: "EH.Item.Type.Armor[other]",
				items: [],
				options: { equippable: true },
				create: [
					{
						label: "EH.Item.Type.Armor[one]",
						icon: "artwork/svg/equipment/armor.svg",
						dataset: {type: "armor"}
					}
				]
			},
			weapons: {
				label: "EH.Item.Type.Weapon[other]",
				items: [],
				options: { equippable: true },
				create: [
					{
						label: "EH.Item.Type.Weapon[one]",
						icon: "artwork/svg/equipment/weapon.svg",
						dataset: {type: "weapon"}
					}
				]
			},
			ammunitionExplosives: {
				label: formatter.format([
					game.i18n.localize("EH.Item.Type.Ammunition[other]"),
					game.i18n.localize("EH.Item.Type.Explosive[other]")
				]),
				items: [],
				create: [
					{
						label: "EH.Item.Type.Ammunition[one]",
						icon: "artwork/svg/equipment/ammunition.svg",
						dataset: {type: "ammunition"}
					},
					{
						label: "EH.Item.Type.Explosive[one]",
						icon: "artwork/svg/equipment/explosive.svg",
						dataset: {type: "explosive"}
					}
				]
			},
			gear: {
				label: "EH.Item.Type.Gear[other]",
				items: [],
				create: [
					{
						label: "EH.Item.Type.Gear[one]",
						icon: "artwork/svg/equipment/gear.svg",
						dataset: {type: "gear"}
					}
				]
			}
		};

		const items = [...context.actor.items].sort((a, b) => a.sort - b.sort);
		for ( const item of items ) {
			const ctx = context.itemContext[item.id] ??= { actions: [] };
			switch (item.type) {
				case "archetype":
					context.features.archetype.primary.item = item;
					break;
				case "class":
					context.features.class.primary.item = item;
					break;
				case "background":
					context.features.background.primary.item = item;
					break;
				case "profession":
					context.features.profession.primary.item = item;
					break;
				case "specialFeature":
				case "talent":
					if ( context.features[item.system.type.value] ) {
						context.features[item.system.type.value].items.push(item);
						break;
					}
					// TODO: Add warning about talent not associated with item type
				case "feat":
				case "trick": // TODO: Give these items their own section
				case "plan": // TODO: Give these items their own section
					context.features.feats.items.push(item);
					break;
				case "armor":
					context.inventory.armor.items.push(item);
					break;
				case "weapon":
					context.inventory.weapons.items.push(item);
					break;
				case "ammunition":
				case "explosive":
					context.inventory.ammunitionExplosives.items.push(item);
					break;
				case "gear":
					context.inventory.gear.items.push(item);
					break;
			}

			// Prepare expanded data
			if ( this.itemsExpanded.has(item.id) ) {
				ctx.expandedData = await item.chatContext({secrets: this.actor.isOwner});
			}
		}

		// TODO: Add additional create buttons for archetype, class, background, & profession if a primary
		// item doesn't exist for those categories.
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Drag & Drop                              */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async _onDropItemCreate(itemData) {
		const items = itemData instanceof Array ? itemData : [itemData];

		const toCreate = [];
		for ( const item of items ) {
			// TODO: Check to make sure items of this type are allowed on this actor
			if ( item.system.advancement?.length ) {
				const manager = AdvancementManager.forNewItem(this.actor, item);
				if ( manager.steps.length ) {
					manager.render(true);
					return false;
				}
			}
			toCreate.push(item);
		}

		return this.actor.createEmbeddedDocuments("Item", toCreate);
	}
}
