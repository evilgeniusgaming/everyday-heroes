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
		context.types = Object.entries(this.advancement.constructor.traits).reduce((types, [key, config]) => {
			types[key] = { ...config, label: `${config.localization}[other]` };
			return types;
		}, {});
		context.showType = this.advancement._type === "Trait";
		const traitConfig = context.types[this.advancement.configuration.type];
		if ( traitConfig.localization ) context.default.title = game.i18n.localize(`${traitConfig.localization}[other]`);
		if ( traitConfig.icon ) context.default.icon = traitConfig.icon;

		if ( !this.advancement.options ) return context;

		context.fixed = {};
		context.choices = {};
		for ( const [key, option] of Object.entries(this.advancement.options) ) {
			context.fixed[key] = {
				label: option.label,
				checked: this.advancement.configuration.fixed.has(key),
				disabled: this.advancement.configuration.choices.has(key)
			};
			context.choices[key] = {
				label: option.label,
				checked: this.advancement.configuration.choices.has(key),
				disabled: this.advancement.configuration.fixed.has(key)
			};
		}

		const type = game.i18n.localize(traitConfig.hintType).toLowerCase();
		let improvement;
		if ( traitConfig.hintImprovement ) improvement = game.i18n.localize(traitConfig.hintImprovement);
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
