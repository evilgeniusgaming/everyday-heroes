import BaseConfigurationDialog from "./base-configuration-dialog.mjs";

/**
 * Roll configuration dialog for Damage Rolls.
 *
 * @param {DamageRoll} roll - Roll being configured.
 */
export default class DamageConfigurationDialog extends BaseConfigurationDialog {

	static _dialogButtons(roll, options, resolve, reject) {
		if ( roll.options.allowCritical === false ) return super._dialogButtons(roll, options, resolve, reject);
		return {
			critical: {
				label: game.i18n.localize("EH.Dice.Action.Critical"),
				callback: html => resolve(this._onDialogSubmit(roll, html, { critical: true }))
			},
			normal: {
				label: game.i18n.localize("EH.Dice.Action.Normal"),
				callback: html => resolve(this._onDialogSubmit(roll, html, { critical: false }))
			}
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Action Handlers                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static _onDialogSubmit(roll, html, options={}) {
		super._onDialogSubmit(roll, html, options);
		roll.options.critical = options.critical ?? false;
		roll.configureRoll();
		return roll;
	}
}
