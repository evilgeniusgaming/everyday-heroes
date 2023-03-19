import BaseActorSheet from "./base-actor-sheet.mjs";

/**
 * Sheet that represents a NPC actor.
 */
export default class NPCSheet extends BaseActorSheet {

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["everyday-heroes", "sheet", "actor", "npc"],
			template: "systems/everyday-heroes/templates/actor/npc-sheet.hbs",
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
		this.prepareLists(context);
		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare type tag, skill, senses, roles, and equipment lists.
	 * @param {object} context - Context object for rendering the sheet. **Will be mutated.**
	 */
	prepareLists(context) {
		const listFormatter = new Intl.ListFormat(game.i18n.lang, {type: "unit", style: "short"});
		context.lists ??= {};
		// TODO: Equipment list
		context.lists.roles = listFormatter.format(context.system.biography.roles.reduce((arr, role) => {
			const label = CONFIG.EverydayHeroes.roles[role];
			if ( label ) arr.push(label);
			return arr;
		}, []));
		context.lists.saves = listFormatter.format(Object.entries(context.abilities).reduce((arr, [key, ability]) => {
			if ( !ability.saveProficiency.hasProficiency ) return arr;
			arr.push(`<a data-action="roll" data-type="ability-save" data-key="${key}">${ability.label} ${ability.mod}</a>`);
			return arr;
		}, []));
		context.lists.skills = listFormatter.format(Object.entries(context.skills).reduce((arr, [key, skill]) => {
			if ( !skill.proficiency.hasProficiency ) return arr;
			arr.push(`<a data-action="roll" data-type="skill" data-key="${key}">${skill.label} ${skill.mod}</a>`);
			return arr;
		}, []));
		context.lists.tags = listFormatter.format(context.system.traits.type.tags);

		const senses = [];
		if ( context.skills.perc ) senses.push(
			game.i18n.format("EH.Sense.PassivePerception", {number: context.skills.perc.passive})
		);
		// TODO: Add special senses
		context.lists.senses = listFormatter.format(senses);
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
}
