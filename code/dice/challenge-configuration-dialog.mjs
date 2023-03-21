import BaseConfigurationDialog from "./base-configuration-dialog.mjs";

/**
 * Roll configuration dialog for Challenge Rolls.
 *
 * @param {ChallengeRoll} roll - Roll being configured.
 */
export default class ChallengeConfigurationDialog extends BaseConfigurationDialog {

	static _dialogButtons(roll, options, resolve, reject) {
		return {
			advantage: {
				label: "Advantage", // TODO: Localize
				callback: html => resolve(this._onDialogSubmit(roll, html, {
					mode: CONFIG.Dice.ChallengeDie.MODES.ADVANTAGE
				}))
			},
			normal: {
				label: "Normal", // TODO: Localize
				callback: html => resolve(this._onDialogSubmit(roll, html, {
					mode: CONFIG.Dice.ChallengeDie.MODES.NORMAL
				}))
			},
			disadvantage: {
				label: "Disadvantage", // TODO: Localize
				callback: html => resolve(this._onDialogSubmit(roll, html, {
					mode: CONFIG.Dice.ChallengeDie.MODES.DISADVANTAGE
				}))
			}
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Context Preparation                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	getData(options={}) {
		return foundry.utils.mergeObject({
			// TODO: Add abilities for skill configuration
		}, super.getData(options));
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Action Handlers                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static _onDialogSubmit(roll, html, options={}) {
		super._onDialogSubmit(roll, html, options);
		roll.options.advantageMode = options.mode;
		roll.configureRoll();
		return roll;
	}
}
