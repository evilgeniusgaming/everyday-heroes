import TraitConfig from "../../applications/advancement/trait-config.mjs";
import TraitFlow from "../../applications/advancement/trait-flow.mjs";
import { TraitConfigurationData, TraitValueData } from "../../data/advancement/trait-data.mjs";
import { numberFormat } from "../../utils.mjs";
import Advancement from "./advancement.mjs";

/**
 * Advancement that presents the player with the option of improving ability scores or gaining proficiency or expertise.
 */
export default class TraitAdvancement extends Advancement {

	static get metadata() {
		return foundry.utils.mergeObject(super.metadata, {
			dataModels: {
				configuration: TraitConfigurationData,
				value: TraitValueData
			},
			order: 30,
			icon: "systems/everyday-heroes/artwork/svg/advancement/trait.svg",
			title: game.i18n.localize("EH.Advancement.Trait.Title"),
			hint: game.i18n.localize("EH.Advancement.Trait.Hint"),
			validItemTypes: new Set(["background", "profession", "class", "feat"]),
			apps: {
				config: TraitConfig,
				flow: TraitFlow
			}
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Traits that can be controlled by this advancement.
	 * @type {object}
	 */
	static get traits() {
		return {
			save: {
				title: "EH.Ability.Proficiency.Label[other]",
				localization: "EH.Ability.Proficiency.Label",
				icon: "systems/everyday-heroes/artwork/svg/advancement/trait-save.svg",
				hintType: "EH.Ability.Label[other]"
			},
			skill: {
				title: "EH.Skill.Proficiency.Label[other]",
				localization: "EH.Skill.Proficiency.Label",
				icon: "systems/everyday-heroes/artwork/svg/advancement/trait-skill.svg",
				hintType: "EH.Skill.Label[other]"
			},
			equipment: {
				title: "EH.Equipment.Proficiency.Label[other]",
				localization: "EH.Equipment.Proficiency.Label",
				icon: "systems/everyday-heroes/artwork/svg/advancement/trait-equipment.svg",
				hintType: "EH.Equipment.Category.Label[other]"
			}
		};
	}

	// TODO: Adjust sorting to ensure expertise is always after proficiency

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Instance Properties                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Options presented based on provided type.
	 * @type {Object<string, LabeledConfiguration>}
	 */
	get options() {
		switch (this.configuration.type) {
			case "asi":
			case "save": return CONFIG.EverydayHeroes.abilities;
			case "skill": return CONFIG.EverydayHeroes.skills;
			case "equipment": return CONFIG.EverydayHeroes.equipmentCategories;
			default: throw new Error("Everyday Heroes | Invalid trait type");
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Preparation Methods                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare data for the Advancement.
	 */
	prepareData() {
		const traitConfig = this.constructor.traits[this.configuration.type];
		this.title = this.title || game.i18n.localize(traitConfig?.title) || this.constructor.metadata.title;
		this.icon = this.icon || traitConfig?.icon ||this.constructor.metadata.icon;
		super.prepareData();
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Display Methods                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	sortingValueForLevel(level) {
		let traitOrder = Object.keys(this.constructor.traits).findIndex(k => k === this.configuration.type);
		if ( this.configuration.expertise ) traitOrder += Object.keys(this.constructor.traits).length;
		return `${this.constructor.metadata.order.paddedString(4)} ${
			traitOrder.paddedString(2)} ${this.titleForLevel(level)}`;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	summaryForLevel(level, { configMode=false }={}) {
		const conf = this.configuration;
		const tags = Array.from(conf.fixed).map(k => this.options[k].label);
		const choices = Array.from(conf.choices).map(k => this.options[k].label);

		const listFormatter = new Intl.ListFormat(game.i18n.lang, {
			type: conf.points === 1 ? "disjunction" : "conjunction", style: "short"
		});
		const pluralRules = new Intl.PluralRules(game.i18n.lang);
		if ( conf.points ) {
			let localizationType;
			if ( !conf.choices.size ) localizationType = "Any";
			else if ( conf.points > 1 ) localizationType = "Limited";
			else if ( conf.points === 1 ) tags.push(listFormatter.format(choices));
			if ( localizationType ) tags.push(game.i18n.format(`EH.Advancement.Trait.Choices.Summary.${localizationType}`, {
				number: numberFormat(conf.points), list: listFormatter.format(choices),
				type: game.i18n.localize(`${this.constructor.traits[conf.type].localization}[${pluralRules.select(conf.points)}]`)
			}));
		}

		return `<ul class="item-tags">${tags.map(t => `<li class="type">${t}</li>`).join("")}</ul>`;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Application Methods                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Can the provided key be improved based on the provided data?
	 * @param {string} key - Trait key to check.
	 * @param {DataModel} system - Actor system data to check against.
	 * @returns {boolean}
	 */
	canApply(key, system) {
		switch (this.configuration.type) {
			case "asi": return system.abilities[key]?.value < system.abilities[key]?.max;
			case "save": return system.abilities[key]?.saveProficiency.multiplier < 1;
			case "skill":
				const skill = system.skills[key]?.proficiency.multiplier;
				if ( this.configuration.expertise ) return skill === 1;
				else return skill < 1;
			case "equipment": return !system.traits.equipment.has(key);
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async apply(level, data) {
		data.assignments = new Set([...this.configuration.fixed, ...data.assignments]);
		const system = this.actor.system;
		const updates = {};

		for ( const key of data.assignments ) {
			if ( !this.canApply(key, system) ) {
				data.assignments.delete(key);
				continue;
			}
			switch (this.configuration.type) {
				case "asi":
					const sourceValue = this.actor.system.toObject().abilities?.[key]?.value;
					updates[`system.abilities.${key}.value`] = (sourceValue ?? this.actor.system.abilities[key].value) + 1;
					break;
				case "save":
					updates[`system.abilities.${key}.saveProficiency.multiplier`] = 1;
					break;
				case "skill":
					updates[`system.skills.${key}.proficiency.multiplier`] = this.configuration.expertise ? 2 : 1;
					break;
				case "equipment":
					// TODO: No need to coerce into an array in V11
					updates["system.traits.equipment"] = Array.from(system.traits.equipment.add(key));
					break;
				default:
					data.assignments.delete(key);
			}
		}

		// TODO: No need to coerce into array in v11
		data.assignments = Array.from(data.assignments);
		this.actor.updateSource(updates);
		this.updateSource({value: data});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	restore(level, data) {
		this.apply(level, data);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Can the provided key be reversed based on the provided data?
	 * @param {string} key - Trait key to check.
	 * @param {DataModel} system - Actor system data to check against.
	 * @returns {boolean}
	 */
	canReverse(key, system) {
		switch (this.configuration.type) {
			case "asi": return system.abilities[key]?.value > 0;
			case "save": return system.abilities[key]?.saveProficiency.multiplier >= 1;
			case "skill": return system.skills[key]?.proficiency.multiplier >= (this.configuration.expertise ? 1 : 0);
			case "equipment": return system.traits.equipment.has(key);
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	reverse(level) {
		const retainedData = foundry.utils.deepClone(this.value);
		const system = this.actor.system;
		const updates = {};

		for ( const key of this.value.assignments ?? [] ) {
			if ( !this.canReverse(key, system) ) continue;
			switch (this.configuration.type) {
				case "asi":
					const sourceValue = this.actor.system.toObject().abilities?.[key]?.value;
					updates[`system.abilities.${key}.value`] = (sourceValue ?? this.actor.system.abilities[key].value) - 1;
					break;
				case "save":
					updates[`system.abilities.${key}.saveProficiency.multiplier`] = 0;
					break;
				case "skill":
					updates[`system.skills.${key}.proficiency.multiplier`] = this.configuration.expertise ? 1 : 0;
					break;
				case "equipment":
					// TODO: No need to coerce into an array in V11
					updates["system.traits.equipment"] = Array.from(system.traits.equipment.delete(key));
					break;
			}
		}

		this.actor.updateSource(updates);
		this.updateSource({ "value.assignments": null });
		return retainedData;
	}
}
