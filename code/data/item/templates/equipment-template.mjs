import { stepDenomination } from "../../../dice/utils.mjs";
import Proficiency from "../../../documents/proficiency.mjs";
import { numberFormat } from "../../../utils.mjs";

/**
 * Data model template for items that are an equipment type.
 *
 * @mixin
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

	/**
	 * Tags displayed in chat or within the item summary.
	 * @type {ChatTag[]}
	 */
	get chatTags() {
		return [
			{ label: this.type.label, class: "type" },
			...this.propertiesTags,
			...this.proficiencyTags,
			...this.physicalTags ?? []
		];
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare tags for properties on this piece of equipment.
	 * @type {ChatTag[]}
	 */
	get propertiesTags() {
		const tags = [];
		for ( const property of this.properties ?? [] ) {
			const config = CONFIG.EverydayHeroes.equipmentProperties[property];
			if ( !config ) continue;
			let label = config.label;
			switch (property) {
				case "burst":
					label += ` ${numberFormat(this.rounds.burst) ?? "—"}`;
					break;
				case "reach":
					const units = CONFIG.EverydayHeroes.lengthUnits[this.range?.units]?.label ?? "";
					label += ` ${this.range?.reach ?? "—"} ${units}`;
					// TODO: Use number formatter with proper unit handling
					break;
				case "thrown":
					if ( !this.range?.short ) break;
					const range = this.range.long > this.range.short
						? `${numberFormat(this.range.short)}/${numberFormat(this.range.long)}`
						: numberFormat(this.range.short);
					label += ` (${range})`;
					break;
				case "versatile":
					if ( !this.damage?.denomination ) break;
					const versatileDenomination = stepDenomination(this.damage?.denomination, 1);
					label += ` d${versatileDenomination}`;
					break;
			}
			tags.push({ label, tooltip: config.hint, class: "property" });
		}
		return tags;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare tags related to equipment proficiency.
	 * @type {ChatTag[]}
	 */
	get proficiencyTags() {
		if ( !this.parent.isEmbedded ) return [];
		const level = this.proficiency.hasProficiency
			? (this.proficiency.multiplier === 1 ? "Proficient" : "Half") : "None";
		return [{
			label: game.i18n.localize(`EH.Proficiency.Level.${level}`),
			class: `${this.proficiency.hasProficiency ? "positive" : "negative"} status`
		}];
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedProficiency() {
		const hasProf = this.user?.system.traits?.equipment
			? this.user.system.traits.equipment.has(this.type.category) : true;
		this.proficiency = new Proficiency(this.user?.system.attributes.prof, hasProf ? 1 : 0);
	}
}
