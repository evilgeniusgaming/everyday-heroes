import ChallengeConfigurationDialog from "./challenge-configuration-dialog.mjs";

/**
 * Roll configuration dialog for Skill Checks.
 */
export default class SkillConfigurationDialog extends ChallengeConfigurationDialog {

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			template: "systems/everyday-heroes/templates/dice/skill-roll-dialog.hbs"
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Context Preparation                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	getData(options={}) {
		return {
			...super.getData(options),
			selectedAbility: this.rolls[0].data.abilityId
		};
	}
}
