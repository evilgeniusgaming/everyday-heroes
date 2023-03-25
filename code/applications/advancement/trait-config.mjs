import { objectToSet } from "../../utils.mjs";
import AdvancementConfig from "./advancement-config.mjs";

/**
 * Configuration application for proficiencies.
 */
export default class TraitConfig extends AdvancementConfig {

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["everyday-heroes", "advancement", "config", "trait", "proficiency"],
			template: "systems/everyday-heroes/templates/advancement/trait-config.hbs",
			width: 400
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	getData() {
		const context = super.getData();
		context.showType = this.advancement._type === "Trait";
		context.types = this.advancement.constructor.traits;
		if ( !this.advancement.options ) return context;

		context.fixed = {};
		context.choices = {};
		for ( const [key, ability] of Object.entries(this.advancement.options) ) {
			context.fixed[key] = {
				label: ability.label,
				checked: this.advancement.configuration.fixed.has(key),
				disabled: this.advancement.configuration.choices.has(key)
			};
			context.choices[key] = {
				label: ability.label,
				checked: this.advancement.configuration.choices.has(key),
				disabled: this.advancement.configuration.fixed.has(key)
			};
		}

		const typeConfig = context.types[this.advancement.configuration.type];
		const type = game.i18n.localize(typeConfig.hintType).toLowerCase();
		let improvement;
		if ( typeConfig.hintImprovement ) improvement = game.i18n.localize(typeConfig.hintImprovement);
		else if ( (this.advancement.configuration.type === "skill") && this.advancement.configuration.expertise ) {
			improvement = game.i18n.localize("EH.Proficiency.Level.Expertise").toLowerCase();
	  } else improvement = game.i18n.localize("EH.Proficiency.Label[one]").toLowerCase();
		context.choicesHint = game.i18n.format("EH.Advancement.Trait.Choices.Hint", { type });
		context.fixedHint = game.i18n.format("EH.Advancement.Trait.Fixed.Hint", { type, improvement });

		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async prepareConfigurationUpdate(configuration) {
		// TODO: No need to coerce into array in v11
		configuration.fixed = Array.from(objectToSet(configuration.fixed ?? {}));
		configuration.choices = Array.from(objectToSet(configuration.choices ?? {}));
		return configuration;
	}
}
