import { numberFormat } from "../../utils.mjs";
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
		const ammunitionTypes = {};

		context.actionSections = {
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

		const callback = async (item, section, ctx) => {
			ctx.label = await item.npcLabel();
			ctx.description = await item.npcDescription();

			if ( ["ammunition", "npcExplosive"].includes(item.type) ) {
				ammunitionTypes[item.system.type.value] ??= {};
				ammunitionTypes[item.system.type.value][item.id] = item;
			}
			if ( ["npcExplosive", "npcWeapon"].includes(item.type) ) {
				context.actionSections.action.items.push(item);
			}
			if ( item.type === "npcFeature" ) {
				if ( !item.system.activation.type ) context.actionSections.passive.items.push(item);
				else if ( item.system.activation.type === "attack" ) context.actionSections.action.items.push(item);
				else context.actionSections[item.system.activation.type]?.items.push(item);
			}
		};

		await this._prepareItemSections(context, callback);

		context.armor = context.inventory.armor.items[0];

		// Prepare ammunition lists
		for ( const item of context.inventory.npcWeapon.items ) {
			const ctx = context.itemContext[item.id].ammunition ??= {};
			const ammunitionTypeConfig = CONFIG.EverydayHeroes.ammunitionTypes[item.system.rounds.type];
			ctx.defaultLabel = ammunitionTypeConfig ? game.i18n.format("EH.Ammunition.Standard.Label", {
				type: ammunitionTypeConfig.label
			}) : game.i18n.localize("EH.Ammunition.Empty.Label");
			ctx.selected = item.system.ammunition?.id;
			ctx.types = ammunitionTypes[item.system.rounds.type] ?? [];
			ctx.displayAmmunitionSelector = (!foundry.utils.isEmpty(ctx.types) || ctx.defaultLabel)
				&& !!item.system.rounds.type;
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareLists(context) {
		const listFormatter = new Intl.ListFormat(game.i18n.lang, {type: "unit", style: "short"});
		context.lists ??= {};

		context.lists.equipment = listFormatter.format(context.actor.items.reduce((arr, item) => {
			if ( !["armor"].includes(item.type) && item.isEquipped
				&& (item.system.constructor.metadata.category === "physical") ) {
				arr.push(`<a data-action="item" data-type="edit" data-item-id="${item.id}">${item.name}</a>`);
			}
			return arr;
		}, []));

		context.lists.resources = listFormatter.format(
			Object.entries(context.system.resources).reduce((arr, [key, resource]) => {
				arr.push(
					`<a ${context.editable ? `data-action="roll" data-type="resource" data-resource="${key}"` : ""} data-tooltip="${
						game.i18n.format(`EH.Action.${resource.denomination ? "Roll" : "Spend"}`, { type: resource.label })
					}">${resource.label}</a> (${numberFormat(resource.available)}/${numberFormat(resource.max)})`
				);
				return arr;
			}, [])
		);

		context.lists.roles = listFormatter.format(context.system.biography.roles.reduce((arr, role) => {
			const label = CONFIG.EverydayHeroes.roles[role];
			arr.push(label ?? role);
			return arr;
		}, []));

		context.lists.saves = listFormatter.format(Object.entries(context.abilities).reduce((arr, [key, ability]) => {
			if ( !ability.saveProficiency.hasProficiency ) return arr;
			arr.push(
				`<a data-action="roll" data-type="ability-save" data-ability="${key}" data-tooltip="${
					game.i18n.format("EH.Action.Roll", {
						type: game.i18n.format("EH.Ability.Action.SaveSpecificShort", { ability: ability.label })
					})
				}">${ability.label} ${ability.save}</a>`
			);
			return arr;
		}, []));

		context.lists.skills = listFormatter.format(Object.entries(context.skills).reduce((arr, [key, skill]) => {
			if ( !skill.proficiency.hasProficiency ) return arr;
			arr.push(
				`<a data-action="roll" data-type="skill" data-skill="${key}" data-tooltip="${
					game.i18n.format("EH.Action.Roll", {
						type: game.i18n.format("EH.Skill.Action.CheckSpecific", { skill: skill.label })
					})
				}">${skill.label} ${skill.mod}</a>`
			);
			return arr;
		}, []));

		if ( context.armor ) {
			context.lists.armorProperties = listFormatter.format(context.armor.system.properties.map(p => {
				const config = CONFIG.EverydayHeroes.equipmentProperties[p];
				if ( !config ) return null;
				const label = config.label.toLowerCase();
				if ( !config.npcHint ) return label;
				return `<span class="property-hint" data-tooltip="${config.npcHint}">${label}</a>`;
			}).filter(p => p));
		}

		const senses = context.system.attributes.senses.reduce((arr, sense) => {
			arr.push(CONFIG.EverydayHeroes.senses[sense] ?? sense);
			return arr;
		}, []);
		if ( context.skills.perc ) senses.unshift(
			game.i18n.format("EH.Sense.PassivePerception", {number: context.skills.perc.passive})
		);
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
