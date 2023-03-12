import Proficiency from "../../../documents/proficiency.mjs";

/**
 * Data model template for items that are an equipment type.
 */
export default class EquipmentTemplate {

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Actions that will be presented with this item on the actor sheet.
	 * @type {object[]}
	 */
	get actions() {
		const actions = [];
		if ( this.hasAttack ) actions.push({
			label: EverydayHeroes.utils.numberFormat(this.attackMod, { sign: true }),
			icon: this.attackIcon,
			tooltip: this.attackTooltip,
			disabled: !this.canAttack,
			data: { type: "attack" }
		});
		if ( this.hasDamage ) actions.push({
			label: this.damageFormula,
			icon: this.damageIcon,
			tooltip: this.damageTooltip,
			data: { type: "damage" }
		});
		return actions;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedProficiency() {
		this.proficiency = new Proficiency(
			this.parent.actor?.system.attributes.prof,
			this.parent.actor?.system.traits.equipment.has(this.type.category) ? 1 : 0
		);
	}
}
