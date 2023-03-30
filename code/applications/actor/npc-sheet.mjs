import BaseActorSheet from "./base-actor-sheet.mjs";

/**
 * Sheet that represents a NPC actor.
 */
export default class NPCSheet extends BaseActorSheet {

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			tabs: [{navSelector: 'nav[data-group="primary"]', contentSelector: "main", initial: "details"}],
			width: 460,
			height: "auto",
			dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Context Preparation                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async getData(options={}) {
		const context = await super.getData(options);

		context.availableRoles = Object.entries(CONFIG.EverydayHeroes.roles).reduce((obj, [key, label]) => {
			obj[key] = { label, disabled: context.system.biography.roles.includes(key) };
			return obj;
		}, {});
		const creatureTypeConfig = CONFIG.EverydayHeroes.creatureTypes[context.system.traits.type.value];
		context.availableTags = Object.entries(creatureTypeConfig?.subtypes ?? []).reduce((obj, [key, label]) => {
			obj[key] = { label, disabled: context.system.traits.type.tags.includes(key) };
			return obj;
		}, {});

		context.cr = { 0.125: "⅛", 0.25: "¼", 0.5: "½" }[context.system.details.cr] ?? context.system.details.cr;

		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async prepareItems(context) {
		context.itemContext = {};

		context.actionSections = {
			// TODO: Dynamically create these sections
			passive: {
				label: "EH.Action.Passive",
				items: []
			},
			action: {
				label: "EH.Action.Type.Action",
				items: []
			},
			bonus: {
				label: "EH.Action.Type.Bonus",
				items: []
			},
			reaction: {
				label: "EH.Action.Type.Reaction",
				items: []
			}
		};
		context.passiveFeatures = [];

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
			},
			features: {
				label: "EH.Item.Type.NPCFeature[other]",
				items: [],
				create: [
					{
						label: "EH.Item.Type.NPCFeature[one]",
						icon: "",
						dataset: {type: "npcFeature"}
					}
				]
			}
		};

		const ammunitionTypes = {};
		const items = [...context.actor.items].sort((a, b) => a.sort - b.sort);
		for ( const item of items ) {
			const ctx = context.itemContext[item.id] ??= {
				label: await item.npcLabel(), description: await item.npcDescription()
			};
			switch (item.type) {
				case "armor":
					context.inventory.armor.items.push(item);
					break;
				case "weapon":
					context.inventory.weapons.items.push(item);
					context.actionSections.action.items.push(item);
					break;
				case "ammunition":
					ammunitionTypes[item.system.type.value] ??= {};
					ammunitionTypes[item.system.type.value][item.id] = item;
				case "explosive":
					context.inventory.ammunitionExplosives.items.push(item);
					break;
				case "gear":
					context.inventory.gear.items.push(item);
					break;
				default:
					context.inventory.features.items.push(item);
					if ( !item.system.activation?.type ) context.actionSections.passive.items.push(item);
					else context.actionSections[item.system.activation.type]?.items.push(item);
					break;
			}

			// Prepare expanded data
			if ( this.itemsExpanded.has(item.id) ) {
				ctx.expandedData = await item.chatContext({secrets: this.actor.isOwner});
			}
		}

		context.armor = context.inventory.armor.items[0];

		// Prepare ammunition lists
		for ( const item of context.inventory.weapons.items ) {
			const ctx = context.itemContext[item.id].ammunition ??= {};
			ctx.defaultLabel = game.i18n.format("EH.Ammunition.Standard.Label", {
				type: CONFIG.EverydayHeroes.ammunitionTypes[item.system.rounds.type]?.label
			});
			ctx.selected = item.system.ammunition?.id;
			ctx.types = ammunitionTypes[item.system.rounds.type] ?? [];
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareLists(context) {
		const listFormatter = new Intl.ListFormat(game.i18n.lang, {type: "unit", style: "short"});
		context.lists ??= {};

		context.lists.equipment = listFormatter.format(context.actor.items.reduce((arr, item) => {
			if ( !["armor"].includes(item.type) && (item.system.constructor.metadata.category === "physical") ) {
				arr.push(`<a data-action="item" data-type="edit" data-item-id="${item.id}">${item.name}</a>`);
			}
			return arr;
		}, []));

		context.lists.roles = listFormatter.format(context.system.biography.roles.reduce((arr, role) => {
			const label = CONFIG.EverydayHeroes.roles[role];
			arr.push(label ?? role);
			return arr;
		}, []));
		context.lists.saves = listFormatter.format(Object.entries(context.abilities).reduce((arr, [key, ability]) => {
			if ( !ability.saveProficiency.hasProficiency ) return arr;
			arr.push(`<a data-action="roll" data-type="ability-save" data-ability="${key}">${ability.label} ${ability.save}</a>`);
			return arr;
		}, []));
		context.lists.skills = listFormatter.format(Object.entries(context.skills).reduce((arr, [key, skill]) => {
			if ( !skill.proficiency.hasProficiency ) return arr;
			arr.push(`<a data-action="roll" data-type="skill" data-skill="${key}">${skill.label} ${skill.mod}</a>`);
			return arr;
		}, []));

		if ( context.armor ) {
			context.lists.armorProperties = listFormatter.format(context.armor.system.properties.map(p =>
				CONFIG.EverydayHeroes.equipmentProperties[p]?.label.toLowerCase() ?? null
			).filter(p => p));
		}

		const senses = [];
		if ( context.skills.perc ) senses.push(
			game.i18n.format("EH.Sense.PassivePerception", {number: context.skills.perc.passive})
		);
		// TODO: Add special senses
		context.lists.senses = listFormatter.format(senses);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Action Handlers                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async _updateObject(event, formData) {
		// TODO: Move this logic into custom NumberField type
		let cr = formData["system.details.cr"];
		cr = {
			"1/8": 0.125, "⅛": 0.125,
			"1/4": 0.25, "¼": 0.25,
			"1/2": 0.5, "½": 0.5
		}[cr] ?? parseFloat(cr);
		if ( Number.isNumeric(cr) ) formData["system.details.cr"] = cr;

		return super._updateObject(event, formData);
	}
}
