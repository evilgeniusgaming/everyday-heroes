import { numberFormat } from "../../../utils.mjs";
import FormulaField from "../../fields/formula-field.mjs";

/**
 * Data model template shared across various explosive types.
 *
 * @property {object} type
 * @property {string} type.category - Equipment category of this item.
 * @property {Set<string>} properties - Explosive's properties.
 * @property {number} dc - Override of default DC to avoid explosion's damage.
 * @property {object} radius
 * @property {number} radius.value - Radius of the explosive's damage area.
 * @property {string} radius.units - Units the radius is expressed in.
 * @property {object} bonuses
 * @property {string} bonuses.damage - Bonus to the explosive's damage.
 * @property {string} bonuses.dc - Bonus to the explosive's DC.
 * @property {object} overrides
 * @property {string} overrides.ability.dc - Ability used when determining the DC of this explosive.
 */
export default class BaseExplosiveTemplate extends foundry.abstract.DataModel {

	static get metadata() {
		return {
			type: "explosive",
			category: "physical",
			localization: "EH.Item.Type.Explosive",
			icon: "fa-solid fa-burst",
			image: "systems/everyday-heroes/artwork/svg/items/explosive.svg",
			advancement: {
				grantable: true
			},
			variant: "explosive"
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		return {
			type: new foundry.data.fields.SchemaField({
				category: new foundry.data.fields.StringField({intial: "basic", label: "EH.Equipment.Category.Label[one]"})
			}, {label: "EH.Item.Type.Label"}),
			properties: new foundry.data.fields.SetField(new foundry.data.fields.StringField(), {
				label: "EH.Weapon.Property.Label"
			}),
			penetrationValue: new foundry.data.fields.NumberField({
				min: 0, integer: true,
				label: "EH.Equipment.Trait.PenetrationValue.Label", hint: "EH.Equipment.Trait.PenetrationValue.Hint"
			}),
			dc: new foundry.data.fields.NumberField({min: 0, integer: true, label: "EH.Explosive.DC.Label"}),
			radius: new foundry.data.fields.SchemaField({
				value: new foundry.data.fields.NumberField({min: 0, step: 0.1, label: ""}),
				units: new foundry.data.fields.StringField({
					initial: () => CONFIG.EverydayHeroes.defaultUnits.length, label: "EH.Measurement.Units"
				})
			}),
			bonuses: new foundry.data.fields.SchemaField({
				damage: new FormulaField({label: "EH.Weapon.Bonus.Damage.Label"}),
				dc: new FormulaField({label: "EH.Weapon.Bonus.DC.Label"})
			}, {label: "EH.Bonus.Label"})
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get attackAbility() {
		if ( this.overrides.ability.attack === "none" ) return null;
		return this.overrides.ability.attack ?? this.rangedAbility;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get attackIcon() {
		return "systems/everyday-heroes/artwork/svg/action/attack-explosive.svg";
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get canCritical() {
		return false;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get chatTags() {
		const tags = [
			{ label: this.type.label, class: "type" },
			...this.propertiesTags,
			...(this._source.dc ? [{
				label: game.i18n.format("EH.DifficultyClass.Tag", {dc: this.dc}),
				class: "property"
			}] : []),
			...this.proficiencyTags,
			...this.physicalTags
		];
		if ( this.radius.value ) tags.splice(1, 0, {
			label: game.i18n.format("EH.Measurement.Radius.Tag", {
				size: numberFormat(this.radius.value, {unit: this.radius.units})
			}),
			class: "detail"
		});
		if ( this.hasDamage ) tags.splice(1, 0, {
			label: `${game.i18n.localize(
				"EH.Equipment.Trait.PenetrationValue.Abbreviation")} ${numberFormat(this.penetrationValue)}`,
			class: "detail"
		});
		return tags;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get damageIcon() {
		return "systems/everyday-heroes/artwork/svg/action/damage-explosive.svg";
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get hasDamageSave() {
		return true;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Migrations                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static migrateOverride(source) {
		if ( !source.overrides ) source.overrides = {};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedTypeLabel() {
		this.type.label = game.i18n.format("EH.Item.Type.DetailedLabel", {
			category: CONFIG.EverydayHeroes.equipmentCategories[this.type.category]?.label ?? "",
			type: CONFIG.EverydayHeroes.explosiveTypes[this.type.value]?.label
				?? game.i18n.localize("EH.Item.Type.Explosive[one]"),
			subtype: ""
		}).trim().replace("  ", " ");
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareFinalDC() {
		this.dc = this._source.dc || 8 + this.attackMod;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Helpers                                  */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Update operations required to convert to and from titanic scale.
	 * @param {boolean} isTitanic - After update, will this parent actor be titanic?
	 * @returns {object}
	 */
	titanicConversions(isTitanic) {
		if ( (isTitanic && (this.radius.units === "space")) || (!isTitanic && (this.radius.units !== "space")) ) return {};
		const updates = {};
		const adjustValue = keyPath => {
			updates[keyPath] = Math.floor(foundry.utils.getProperty(this.parent, keyPath) * (isTitanic ? 0.2 : 5));
		};
		adjustValue("system.radius.value");
		updates["system.radius.units"] = isTitanic ? "space" : "foot";
		adjustValue("system.range.short");
		adjustValue("system.range.long");
		updates["system.range.units"] = isTitanic ? "space" : "foot";
		return updates;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Socket Event Handlers                    */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async _preCreateTitanicConversions(data, options, user) {
		const updates = this.titanicConversions(this.isTitanic);
		if ( !foundry.utils.isEmpty(updates) ) this.parent.updateSource(updates);
	}
}
