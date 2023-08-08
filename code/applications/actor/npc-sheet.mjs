import { filterObject, numberFormat } from "../../utils.mjs";
import BaseActorSheet from "./base-actor-sheet.mjs";

/**
 * Sheet that represents a NPC actor.
 */
export default class NPCSheet extends BaseActorSheet {

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			tabs: [{navSelector: 'nav[data-group="primary"]', contentSelector: "main", initial: "details"}],
			width: 460,
			height: "auto"
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
		context.sizes = {
			normal: filterObject(CONFIG.EverydayHeroes.sizes, v => !v.titanic),
			titanic: game.settings.get("everyday-heroes", "titanicSizes")
				? filterObject(CONFIG.EverydayHeroes.sizes, v => v.titanic) : null
		};

		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async prepareItems(context) {
		const cinematicActions = context.actor.system.details.cinematicActions;
		const makeLabel = action => game.i18n.format("EH.Feature.Type.LabelSpecific", {action: game.i18n.localize(action)});
		context.actionSections = {
			passive: {
				label: "EH.Action.Passive",
				items: [],
				create: [
					{
						label: makeLabel("EH.Action.Passive"),
						dataset: { type: "npcFeature" }
					}
				]
			},
			action: {
				label: cinematicActions.max
					? `${game.i18n.localize("EH.Action.Type.CinematicAction[other]")} (${cinematicActions.label})`
					: "EH.Action.Type.Action[other]",
				items: [],
				config: "action",
				create: [
					{
						label: makeLabel("EH.Action.Type.Action[one]"),
						dataset: { type: "npcFeature", "system.activation.type": "action" }
					},
					{
						label: game.i18n.localize("EH.Item.Type.Weapon[one]"),
						dataset: { type: "npcWeapon" }
					}
				]
			},
			bonus: {
				label: "EH.Action.Type.Bonus[other]",
				items: [],
				create: [
					{
						label: makeLabel("EH.Action.Type.Bonus[one]"),
						dataset: { type: "npcFeature", "system.activation.type": "bonus" }
					}
				]
			},
			reaction: {
				label: "EH.Action.Type.Reaction[other]",
				items: [],
				create: [
					{
						label: makeLabel("EH.Action.Type.Reaction[one]"),
						dataset: { type: "npcFeature", "system.activation.type": "reaction" }
					}
				]
			}
		};
		context.ammunitionTypes = {};

		const callback = async (item, section, ctx) => {
			ctx.label = await item.npcLabel();
			ctx.description = await item.npcDescription();

			if ( ["ammunition", "npcExplosive"].includes(item.type) ) {
				context.ammunitionTypes[item.system.type.value] ??= {};
				context.ammunitionTypes[item.system.type.value][item.id] = item;
			}
			if ( foundry.utils.hasProperty(item.system, "activation.type") ) {
				if ( !item.system.activation.type ) context.actionSections.passive.items.push(item);
				else if ( item.system.activation.type === "attack" ) context.actionSections.action.items.push(item);
				else context.actionSections[item.system.activation.type]?.items.push(item);
			} else if ( ["npcExplosive", "npcWeapon"].includes(item.type) ) {
				context.actionSections.action.items.push(item);
			}
		};

		await this._prepareItemSections(context, callback);
		this._prepareItemAmmunition(context, context.inventory.npcWeapon.items);

		context.armor = context.inventory.armor.items[0];
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
