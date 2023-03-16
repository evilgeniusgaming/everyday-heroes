import BaseConfigurationDialog from "./base-configuration-dialog.mjs";

/**
 * Roll configuration dialog for Damage Rolls.
 *
 * @param {DamageRoll} roll - Roll being configured.
 */
export default class DamageConfigurationDialog extends BaseConfigurationDialog {

	static _dialogButtons(roll, options, resolve, reject) {
		return {
			critical: {
				label: "Critical Hit", // TODO: Localize
				callback: html => resolve(this._onDialogSubmit(roll, html, { critical: true }))
			},
			normal: {
				label: "Normal", // TODO: Localize
				callback: html => resolve(this._onDialogSubmit(roll, html, { critical: false }))
			}
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Action Handlers                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static _onDialogSubmit(roll, html, options={}) {
		super._onDialogSubmit(roll, html, options);
		roll.options.critical = options.critical;
		roll.configureDamage();
		return roll;
	}
}
