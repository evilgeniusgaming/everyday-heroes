import BaseConfig from "./base-config.mjs";

/**
 * Dialog for configuring an individual skill.
 * @param {string} skillId - The skill being modified by this app.
 * @param {ActorEH} actor - The actor to whom the skill belongs.
 * @param {object} options - Additional application rendering options.
 */
export default class SkillConfig extends BaseConfig {
	constructor(skillId, actor, options) {
		super(actor, options);
		this.skillId = skillId;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["everyday-heroes", "config", "skill"],
			template: "systems/everyday-heroes/templates/actor/dialogs/skill-config.hbs",
			width: 500,
			height: "auto"
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * The ability being modified by this app.
	 * @type {string}
	 */
	skillId;

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Context Preparation                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async getData(options) {
		const context = await super.getData(options);
		context.skillId = this.skillId;
		context.skill = context.src.skills[this.skillId]
			?? this.document.system.skills[this.skillId] ?? {};
		context.proficiencyLevels = {
			0: game.i18n.localize("EH.Proficiency.Level.None"),
			0.5: game.i18n.localize("EH.Proficiency.Level.Half"),
			1: game.i18n.localize("EH.Proficiency.Level.Proficient"),
			2: game.i18n.localize("EH.Proficiency.Level.Expertise")
		};
		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Action Handlers                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_onChangeInput(event) {
		super._onChangeInput(event);
		if ( event.target.name === "skillId" ) {
			this.skillId = event.target.value;
			this.render();
		}
	}
}
