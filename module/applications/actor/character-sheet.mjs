export default class CharacterSheetEH extends ActorSheet {
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["everyday-heroes", "sheet", "actor", "character"],
			template: "systems/everyday-heroes/templates/actor/character-sheet.hbs",
			width: 720,
			height: 680
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async getData(options) {
		const context = await super.getData(options);

		context.CONFIG = CONFIG.EverydayHeroes;
		context.system = context.actor.system;

		const modFormatter = new Intl.NumberFormat(game.i18n.lang, { signDisplay: "exceptZero" });

		context.abilities = foundry.utils.deepClone(context.system.abilities);
		for ( const [id, ability] of Object.entries(context.abilities) ) {
			const abilityConfig = CONFIG.EverydayHeroes.abilities[id];
			ability.label = abilityConfig.label;
			ability.abbreviation = abilityConfig.abbreviation;
			ability.mod = modFormatter.format(ability.mod);
			ability.save = modFormatter.format(ability.save);
		}

		context.skills = foundry.utils.deepClone(context.system.skills);
		for ( const [id, skill] of Object.entries(context.skills) ) {
			const skillConfig = CONFIG.EverydayHeroes.skills[id];
			const abilityConfig = CONFIG.EverydayHeroes.abilities[skill.ability];
			skill.label = skillConfig.label;
			skill.abilityAbbreviation = abilityConfig?.abbreviation;
			skill.mod = modFormatter.format(skill.mod);
		}

		return context;
	}
}
