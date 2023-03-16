import { numberFormat } from "../../utils.mjs";
import SystemDataModel from "../abstract/system-data-model.mjs";
import FormulaField from "../fields/formula-field.mjs";
import AttackTemplate from "./templates/attack-template.mjs";
import DamageTemplate from "./templates/damage-template.mjs";
import DescribedTemplate from "./templates/described-template.mjs";
import EquipmentTemplate from "./templates/equipment-template.mjs";
import PhysicalTemplate from "./templates/physical-template.mjs";

/**
 * Data definition for Weapon items.
 * @mixes {@link AttackTemplate}
 * @mixes {@link DamageTemplate}
 * @mixes {@link DescribedTemplate}
 * @mixes {@link EquipmentTemplate}
 * @mixes {@link PhysicalTemplate}
 *
 * @property {object} type
 * @property {string} type.value - Whether this is a melee or ranged weapon.
 * @property {string} type.category - Equipment category of this item.
 * @property {Set<string>} properties - Weapon's properties.
 * @property {number} penetrationValue - How armor piercing is this weapon?
 * @property {object} range
 * @property {number} range.short - Normal range for ranged or thrown weapons.
 * @property {number} range.long - Long range for ranged or thrown weapons.
 * @property {number} range.reach - Reach for melee weapons with the "Reach" property.
 * @property {string} range.units - Units represented by the range values.
 * @property {string} reload - Action type required to reload this weapon.
 * @property {object} rounds
 * @property {number} rounds.spend - Number of rounds that have been spend from the current magazine.
 * @property {number} rounds.capacity - Capacity of this weapon's magazine.
 * @property {number} rounds.burst - Number of rounds expended while taking burst shot.
 * @property {string} rounds.type - Type of ammunition that can be loaded into this weapon.
 * @property {object} bonuses
 * @property {string} bonuses.attack - Bonus to the weapon's attack rolls.
 * @property {string} bonuses.damage - Bonus to the weapon's damage rolls.
 */
export default class WeaponData extends SystemDataModel.mixin(
	AttackTemplate, DamageTemplate, DescribedTemplate, EquipmentTemplate, PhysicalTemplate
) {
	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			type: new foundry.data.fields.SchemaField({
				value: new foundry.data.fields.StringField({initial: "melee", label: "EH.Weapon.Type.Label"}),
				category: new foundry.data.fields.StringField({intial: "basic", label: "EH.Equipment.Category.Label[one]"})
			}, {label: "EH.Item.Type.Label"}),
			properties: new foundry.data.fields.SetField(new foundry.data.fields.StringField(), {
				label: "EH.Weapon.Property.Label"
			}),
			penetrationValue: new foundry.data.fields.NumberField({
				min: 0, integer: true,
				label: "EH.Equipment.Trait.PenetrationValue.Label", hint: "EH.Equipment.Trait.PenetrationValue.Hint"
			}),
			range: new foundry.data.fields.SchemaField({
				short: new foundry.data.fields.NumberField({min: 0, step: 0.1, label: "EH.Equipment.Trait.Range.Short"}),
				long: new foundry.data.fields.NumberField({min: 0, step: 0.1, label: "EH.Equipment.Trait.Range.Long"}),
				reach: new foundry.data.fields.NumberField({min: 0, step: 0.1, label: "EH.Equipment.Trait.Range.Reach"}),
				units: new foundry.data.fields.StringField({label: "EH.Measurement.Units"})
				// TODO: Set default based on default units setting
			}, {label: "EH.Equipment.Trait.Range.Label", hint: "EH.Equipment.Trait.Range.Hint"}),
			reload: new foundry.data.fields.StringField({
				label: "EH.Equipment.Trait.Reload.Label", hint: "EH.Equipment.Trait.Reload.Hint"
			}),
			rounds: new foundry.data.fields.SchemaField({
				spent: new foundry.data.fields.NumberField({
					initial: 0, min: 0, integer: true, label: "EH.Equipment.Trait.Rounds.Spent"
				}),
				capacity: new foundry.data.fields.NumberField({
					min: 0, integer: true, label: "EH.Equipment.Trait.Rounds.Capacity"
				}),
				burst: new foundry.data.fields.NumberField({
					min: 0, integer: true,
					label: "EH.Equipment.Trait.Rounds.Burst.Label", hint: "EH.Equipment.Trait.Rounds.Burst.Hint"
				}),
				type: new foundry.data.fields.StringField({label: "EH.Ammunition.Type.Label"})
			}, {label: "EH.Equipment.Trait.Rounds.Label", hint: "EH.Equipment.Trait.Rounds.Hint"}),
			bonuses: new foundry.data.fields.SchemaField({
				attack: new FormulaField({label: "EH.Weapon.Bonus.Attack.Label"}),
				damage: new FormulaField({label: "EH.Weapon.Bonus.Damage.Label"})
			})
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get attackAbility() {
		const DEF = CONFIG.EverydayHeroes.defaultAbilities;

		// Finesse, higher of dexterity or strength
		if ( this.properties.has("finesse") ) {
			const abilities = this.parent?.actor?.system.abilities;
			if ( !abilities ) return ["ranged", "thrown"].includes(this.type) ? DEF.ranged : DEF.melee;
			if ( abilities[DEF.ranged]?.mod > abilities[DEF.melee]?.mod ) return DEF.ranged;
			return DEF.melee;
		}

		return (this.type.value === "ranged") ? DEF.ranged : DEF.melee;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get attackIcon() {
		const config = CONFIG.EverydayHeroes.weaponModes[this.mode];
		if ( !config ) return "systems/everyday-heroes/artwork/svg/action/attack-melee-one-handed.svg";
		if ( !config.icons ) return config.icon;
		return config.icons[this.type.value];
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get attackTooltip() {
		if ( !this.mode ) return super.attackTooltip;
		const type = game.i18n.format("EH.Weapon.Action.AttackSpecific", {
			type: CONFIG.EverydayHeroes.weaponModes[this.mode].label
		});
		return game.i18n.format("EH.Action.Roll", { type });
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get canAttack() {
		return this.roundsToSpend <= this.rounds.available;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get chatTags() {
		return [
			{ label: this.type.label, class: "type" },
			// TODO: Range
			// TODO: Rounds
			// TODO: Reload
			{
				label: `${game.i18n.localize(
					"EH.Equipment.Trait.PenetrationValue.Abbreviation")} ${numberFormat(this.penetrationValue)}`,
				class: "property"
			},
			...this.propertiesTags,
			...this.physicalTags
		];
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get damageAbility() {
		if ( this.mode === "offhand" ) return null;
		return this.attackAbility;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get damageIcon() {
		const type = (this.mode === "thrown") || (this.type.value === "ranged") ? "ranged" : "melee";
		return `systems/everyday-heroes/artwork/svg/action/damage-${type}.svg`;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Subset of `CONFIG.EverydayHeroes.weaponModes` that can be used by this weapon.
	 * @type {WeaponModeConfiguration[]}
	 */
	get modes() {
		const modes = {};
		for ( const [mode, config] of Object.entries(CONFIG.EverydayHeroes.weaponModes) ) {
			if ( !config.available(this.parent) ) continue;
			modes[mode] = foundry.utils.deepClone(config);
			const icon = modes[mode].icons?.[this.type.value];
			if ( icon ) modes[mode].icon = icon;
		}
		return modes;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Icon display on the reload button.
	 * @type {string}
	 */
	get reloadIcon() {
		return "systems/everyday-heroes/artwork/svg/action/reload.svg";
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * How many rounds should be spent when this weapon is fired in the current mode.
	 * @type {number}
	 */
	get roundsToSpend() {
		if ( !this.usesRounds || !this.rounds.capacity ) return 0;
		if ( this.mode === "burst" ) return this.rounds.burst || 1;
		return 1;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Is range a relevant concept for this weapon?
	 * @type {boolean}
	 */
	get usesRange() {
		return (this.type.value === "ranged") || this.properties.has("thrown");
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Are rounds a relevant concept for this weapon?
	 * @type {boolean}
	 */
	get usesRounds() {
		return (this.type.value === "ranged");
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareBaseAmmunition() {
		const ammunitionId = this.parent?.actor?.system.items?.[this.parent?.id]?.ammunition;
		const ammunition = this.parent?.actor?.items.get(ammunitionId);
		if ( !ammunition ) return;
		this.ammunition = ammunition;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareBaseMode() {
		const mode = this.parent?.actor?.system.items?.[this.parent.id]?.mode ?? this._source.mode;
		this.mode = this.modes[mode] ? mode : Object.keys(this.modes)[0];
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedDamage() {
		if ( this.ammunition ) this.damage.modify(this.ammunition);
		if ( this.mode === "burst" ) this.damage.modify({ number: 1 });
		if ( this.properties.has("versatile") && (this.mode === "twoHanded") ) this.damage.modify({ denomination: 1 });
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedPenetrationValue() {
		this.penetrationValue += this.ammunition?.system.penetrationValue ?? 0;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedRounds() {
		this.rounds.spent = Math.min(this.rounds.spent, this.rounds.capacity);
		this.rounds.available = this.rounds.capacity - this.rounds.spent;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedTypeLabel() {
		this.type.label = game.i18n.format("EH.Item.Type.DetailedLabel", {
			category: CONFIG.EverydayHeroes.equipmentCategories[this.type.category]?.label ?? "",
			type: game.i18n.localize("EH.Item.Type.Weapon[one]"),
			subtype: CONFIG.EverydayHeroes.weaponTypes[this.type.value]?.label ?? ""
		}).trim();
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Helpers                                  */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Description of this item that will appear on the details tab of NPC sheets.
	 * @returns {Promise<string>}
	 */
	async npcDescription() {
		let description = "<p><em>";

		// Type
		const type = CONFIG.EverydayHeroes.weaponTypes[this.type.value];
		if ( type ) description += game.i18n.format("EH.Weapon.Action.AttackSpecific", {type: type.label});
		else description += game.i18n.localize("EH.Weapon.Action.AttackGeneric");
		description += ":</em> ";

		// To Hit
		description += `<a data-action="roll-item" data-type="attack">${
			game.i18n.format("EH.Weapon.ToHit", {mod: numberFormat(this.attackMod, {sign: true})}).toLowerCase()}</a>, `;

		// Penetration Value
		description += `${game.i18n.localize("EH.Equipment.Trait.PenetrationValue.Abbreviation")} ${
			numberFormat(this.penetrationValue)}, `;

		// Range
		if ( ((this.type.value === "ranged") || this.properties.has("thrown")) && this.range.short ) {
			description += `${game.i18n.localize("EH.Equipment.Trait.Range.Label").toLowerCase()} ${
				numberFormat(this.range.short)}`;
			if ( this.range.long > this.range.short ) description += `/${numberFormat(this.range.long)}`;
			description += ` ${CONFIG.EverydayHeroes.lengthUnits[this.range.units]?.abbreviation}., `;
			// TODO: Use numberFormat with proper unit formatting
		}

		// Reach
		if ( this.type.value === "melee" ) {
			description += `${game.i18n.localize("EH.Equipment.Trait.Range.Reach").toLowerCase()} ${
				numberFormat(this.range.reach ?? 5)} `;
			description += `${CONFIG.EverydayHeroes.lengthUnits[this.range.units]?.abbreviation}., `;
			// TODO: Use numberFormat with proper unit formatting
		}

		// Targets

		// Damage types
		const modes = this.modes;
		modes.findSplice(m => m === "offhand");
		const damages = [];
		for ( const mode of modes ) {
			const config = CONFIG.EverydayHeroes.weaponModes[mode];
			const clone = this.parent.clone({"system.mode": mode});
			// TODO: Modify this so it doesn't have to clone the whole item
			const type = game.i18n.format("EH.Damage.Specific", {
				type: CONFIG.EverydayHeroes.damageTypes[clone.system.damage.type]?.label
			});
			let string = '<a data-action="roll-item" data-type="damage" data-mode="mode">';
			string += clone.system.damage.average;
			if ( clone.system.damage.denomination ) string += ` (${clone.system.damageFormula})`;
			string += ` ${type.toLowerCase()}</a>`;
			if ( config.npcHint ) string += ` ${config.npcHint}`;
			damages.push(string);
		}
		const listFormatter = new Intl.ListFormat(game.i18n.lang, {type: "conjunction", style: "short"});
		description += `<em>Hit:</em> ${listFormatter.format(damages)}.</p> `;

		console.log(this.description.chat);
		if ( this.description.chat ) {
			description += await TextEditor.enrichHTML(this.description.chat ?? "", {
				secrets: this.parent.isOwner, rollData: this.parent.getRollData(), async: true, relativeTo: this.parent
			});
			// description = listFormatter.format([description, chatDescription]);
		} else {
			// description += ".";
		}

		return description;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Label that will appear on the details tab of NPC sheets.
	 * @returns {Promise<string>}
	 */
	async npcLabel() {
		let label = `<a data-action="roll-item" data-type="activate">${this.parent.name}</a>`;
		if ( this.rounds.capacity ) {
			label += ' <span>(<a data-action="item" data-type="reload">';
			label += `${numberFormat(this.rounds.available)}/${numberFormat(this.rounds.capacity)} ${
				game.i18n.format("EH.Ammunition.Rounds.Label[other]")}`;
			if ( this.reload ) label += `; ${CONFIG.EverydayHeroes.actionTypesReload[this.reload].toLowerCase()}`;
			label += "</a>)</span>";
		}
		return label;
	}
}
