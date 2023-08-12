import { simplifyBonus } from "../../../utils.mjs";
import PrimaryDamageData from "../../shared/primary-damage-data.mjs";
import SupplementalDamageData from "../../shared/supplemental-damage-data.mjs";
import DamageModificationData from "../../shared/damage-modification-data.mjs";

/**
 * Data model template for items that cause damage.
 *
 * @property {PrimaryDamageData} damage - Damage represented by this item.
 * @property {SupplementalDamageData[]} supplementalDamage - Additional damage parts.
 * @property {object} overrides
 * @property {object} overrides.ability
 * @property {string} overrides.ability.damage - Ability used when calculating damage.
 * @mixin
 */
export default class Damage extends foundry.abstract.DataModel {

	/**
	 * Damage mode to use when constructing the schema, either "regular" or "modification".
	 * @type {string}
	 */
	static damageMode = "regular";

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		return {
			damage: new foundry.data.fields.EmbeddedDataField(
				this.damageMode === "regular" ? PrimaryDamageData : DamageModificationData,
				{ label: "EH.Equipment.Trait.Damage.Label", hint: "EH.Equipment.Trait.Damage.Hint" }
			),
			supplementalDamage: new foundry.data.fields.ArrayField(
				new foundry.data.fields.EmbeddedDataField(SupplementalDamageData), {
					label: "EH.Equipment.Trait.SupplementalDamage.Label", hint: "EH.Equipment.Trait.SupplementalDamage.Hint"
				}
			),
			overrides: new foundry.data.fields.SchemaField({
				ability: new foundry.data.fields.SchemaField({
					damage: new foundry.data.fields.StringField({
						label: "EH.Weapon.Overrides.Ability.Damage.Label", hint: "EH.Weapon.Overrides.Ability.Damage.Hint"
					})
				})
			}, {label: "EH.Override.Label"})
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Actions that should be displayed in the damage chat card.
	 * @type {object[]}
	 */
	get baseDamageChatActions() {
		const actions = [];
		const dc = this.dc ?? 8 + (this.attackMod ?? 0);

		// Dexterity save to take half damage
		if ( this.hasDamage && this.hasDamageSave ) {
			// TODO: Allow customizing default ability used to evade explosives
			actions.push({
				label: game.i18n.format("EH.ChallengeRating.Action", {
					dc, action: game.i18n.format("EH.Ability.Action.SaveSpecificShort", {
						ability: CONFIG.EverydayHeroes.abilities.dex?.label ?? ""
					})
				}),
				results: {
					success: {
						label: game.i18n.localize("EH.Roll.Result.Success"),
						summary: game.i18n.localize("EH.Damage.Effect.Half")
					},
					failure: {
						label: game.i18n.localize("EH.Roll.Result.Failure"),
						summary: game.i18n.localize("EH.Damage.Effect.Full")
					}
				},
				type: "ability-save",
				dataset: { ability: "dex", options: { target: dc } }
			});
		}

		// Constitution save to avoid effects
		const properties = this.properties.filter(p =>
			CONFIG.EverydayHeroes.conditions[CONFIG.EverydayHeroes.equipmentProperties[p].condition]
		);
		if ( !properties.size ) return actions;

		const listFormatter = new Intl.ListFormat(game.i18n.lang, { style: "short", type: "conjunction" });
		const conditions = listFormatter.format(properties.map(p =>
			CONFIG.EverydayHeroes.conditions[CONFIG.EverydayHeroes.equipmentProperties[p].condition].label
		));

		// TODO: Allow customizing default ability used to avoid conditions
		actions.push({
			label: game.i18n.format("EH.ChallengeRating.Action", {
				dc, action: game.i18n.format("EH.Ability.Action.SaveSpecificShort", {
					ability: CONFIG.EverydayHeroes.abilities.con?.label ?? ""
				})
			}),
			results: {
				success: {
					label: game.i18n.localize("EH.Roll.Result.Success"),
					summary: game.i18n.localize("EH.Condition.Effect.None")
				},
				failure: {
					label: game.i18n.localize("EH.Roll.Result.Failure"),
					summary: game.i18n.format(`EH.Condition.Effect.${properties.size > 1 ? "Multiple" : "One"}`, { conditions })
				}
			},
			type: "ability-save",
			dataset: { ability: "con", options: { target: dc } }
		});

		return actions;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Can critical damage be rolled with this item?
	 * @type {boolean}
	 */
	get canCritical() {
		return true;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Key for the ability that adds to damage rolls for this item, taking mode into account if it has one.
	 * @type {string|null}
	 */
	get damageAbility() {
		if ( (this.overrides.ability.damage === "none") || !this.damage.denomination ) return null;
		return this.overrides.ability.damage || null;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Action that will be presented with this item on the actor sheet.
	 * @type {object}
	 */
	get damageAction() {
		return {
			label: this.damageFormula,
			icon: this.damageIcon,
			tooltip: this.damageTooltip,
			data: { type: "damage" }
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Actions that should be displayed in the damage chat card.
	 * @type {object[]}
	 */
	get damageChatActions() {
		return this.baseDamageChatActions;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * The simplified damage formula for this item, taking mode into account if it has one.
	 * @type {string}
	 */
	get damageFormula() {
		const formulas = [
			this.damage.formula(this.damageMod),
			...this.supplementalDamage.map(s => s.formula())
		].filter(f => f);
		return formulas.join(" + ");
		// TODO: Add formula simplification
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Icon display on the damage button.
	 * @type {string}
	 */
	get damageIcon() {
		return "systems/everyday-heroes/artwork/svg/action/damage-melee.svg";
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get damageMod() {
		const ability = this.user?.system.abilities[this.damageAbility];
		const rollData = this.getRollData();
		return (ability?.mod ?? 0)
			+ simplifyBonus(this.bonuses.damage, rollData)
			+ simplifyBonus(this.ammunition?.system.bonuses.damage, rollData)
			+ simplifyBonus(this.user?.system.bonuses?.damage?.all, rollData)
			+ simplifyBonus(this.user?.system.bonuses?.damage?.[this.type.value], rollData);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Is the damage defined on this item "regular" damage or a "modification" to another damage?
	 * @type {string}
	 */
	get damageMode() {
		return this.constructor.damageMode;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Tooltip displayed for damage button.
	 * @type {string}
	 */
	get damageTooltip() {
		return game.i18n.format("EH.Action.Roll", { type: game.i18n.localize("EH.Weapon.Action.DamageGeneric.Label") });
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Has a damage type been specified for this item?
	 * @type {boolean}
	 */
	get hasDamage() {
		return this.damage.type !== "";
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Can the damage from item be reduced with a save?
	 * @type {boolean}
	 */
	get hasDamageSave() {
		return false;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Migrations                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static migrateSupplementalDamage(source) {
		source.supplementalDamage ??= [];
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareBaseDamage() {
		this.damage.prepareBaseData?.();
		this.supplementalDamage.forEach(d => d.prepareBaseData?.());
	}
}
