import BaseConfigurationDialog from "./base-configuration-dialog.mjs";

/**
 * Roll configuration dialog for Challenge Rolls.
 */
export default class ChallengeConfigurationDialog extends BaseConfigurationDialog {

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			rollType: CONFIG.Dice.ChallengeRoll
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Context Preparation                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	getButtons() {
		return {
			advantage: { label: game.i18n.localize("EH.Dice.Action.Advantage") },
			normal: { label: game.i18n.localize("EH.Dice.Action.Normal") },
			disadvantage: { label: game.i18n.localize("EH.Dice.Action.Disadvantage") }
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Action Handlers                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	finalizeRolls(action) {
		const rolls = [];
		for ( const roll of this.rolls ) {
			switch (action) {
				case "advantage":
					roll.options.advantageMode = CONFIG.Dice.ChallengeDie.MODES.ADVANTAGE;
					break;
				case "disadvantage":
					roll.options.advantageMode = CONFIG.Dice.ChallengeDie.MODES.DISADVANTAGE;
					break;
				case "normal":
					roll.options.advantageMode = CONFIG.Dice.ChallengeDie.MODES.NORMAL;
					break;
			}
			roll.configureRoll();
			rolls.push(roll);
		}
		return rolls;
	}
}
