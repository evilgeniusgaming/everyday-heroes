import TraitConfig from "../../applications/advancement/trait-config.mjs";
import TraitFlow from "../../applications/advancement/trait-flow.mjs";
import { TraitConfigurationData, TraitValueData } from "../../data/advancement/trait-data.mjs";
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
				label: "EH.Ability.Proficiency.Label[other]",
				icon: "systems/everyday-heroes/artwork/svg/advancement/trait-save.svg",
				hintType: "EH.Ability.Label[other]"
			},
			skill: {
				label: "EH.Skill.Proficiency.Label[other]",
				icon: "systems/everyday-heroes/artwork/svg/advancement/trait-skill.svg",
				hintType: "EH.Skill.Label[other]"
			},
			equipment: {
				label: "EH.Equipment.Proficiency.Label[other]",
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
	 * @type {Object<string, LabeledConfiguration>|null}
	 */
	get options() {
		switch (this.configuration.type) {
			case "asi":
			case "save": return CONFIG.EverydayHeroes.abilities;
			case "skill": return CONFIG.EverydayHeroes.skills;
			case "equipment": return CONFIG.EverydayHeroes.equipmentCategories;
			default: return null;
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
		this.title = this.title || game.i18n.localize(traitConfig?.label) || this.constructor.metadata.title;
		this.icon = this.icon || traitConfig?.icon ||this.constructor.metadata.icon;
		super.prepareData();
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Display Methods                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	summaryForLevel(level, { configMode=false }={}) {
		// TODO: Display proper summary
		return "";
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
