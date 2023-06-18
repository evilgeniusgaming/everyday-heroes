import BaseConfigurationDialog from "./base-configuration-dialog.mjs";

/**
 * Roll configuration dialog for Damage Rolls.
 */
export default class DamageConfigurationDialog extends BaseConfigurationDialog {

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			template: "systems/everyday-heroes/templates/dice/damage-roll-dialog.hbs",
			rollType: CONFIG.Dice.DamageRoll
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Context Preparation                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	getButtons() {
		const buttons = {};
		if ( this.rollConfig.options.allowCritical !== false ) {
			buttons.critical = { label: game.i18n.localize("EH.Dice.Action.Critical") };
		}
		buttons.normal = { label: game.i18n.localize("EH.Dice.Action.Normal") };
		return buttons;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	getData(options={}) {
		return foundry.utils.mergeObject({
			damageTypes: this.options.damageTypes ? Object.fromEntries(Object.entries(CONFIG.EverydayHeroes.damageTypes)
				.filter(([k, v]) => this.options.damageTypes.has(k))
			) : null,
			selectedDamageType: this.rolls[0].options.type
		}, super.getData(options));
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Action Handlers                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	finalizeRolls(action) {
		const rolls = this.rolls;
		for ( const roll of rolls ) {
			roll.options.critical = action === "critical";
			roll.configureRoll();
		}
		return rolls;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_buildRolls(config, formData={}) {
		config = foundry.utils.mergeObject({parts: [], data: {}, options: {}}, config);
		if ( formData.damageType ) config.options.type = formData.damageType;
		return super._buildRolls(config, formData);
	}
}
