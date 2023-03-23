import SystemDataModel from "../abstract/system-data-model.mjs";
import FormulaField from "../fields/formula-field.mjs";
import MappingField from "../fields/mapping-field.mjs";
import { simplifyBonus } from "../../utils.mjs";
import Proficiency from "../../documents/proficiency.mjs";
import AbilitiesTemplate from "./templates/abilities-template.mjs";
import InitiativeTemplate from "./templates/initiative-template.mjs";
import MovementTemplate from "./templates/movement-template.mjs";
import ResourcesTemplate from "./templates/resources-template.mjs";
import SkillsTemplate from "./templates/skills-template.mjs";

/**
 * Data definition for Character actors.
 * @mixes {@link AbilitiesTemplate}
 * @mixes {@link InitiativeTemplate}
 * @mixes {@link MovementTemplate}
 * @mixes {@link ResourcesTemplate}
 * @mixes {@link SkillsTemplate}
 */
export default class HeroData extends SystemDataModel.mixin(
	AbilitiesTemplate, InitiativeTemplate, MovementTemplate, ResourcesTemplate, SkillsTemplate
) {

	static metadata = {
		type: "hero",
		localization: "EH.Actor.Type.Hero"
	};

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			attributes: new foundry.data.fields.SchemaField({
				death: new foundry.data.fields.SchemaField({
					status: new foundry.data.fields.StringField({initial: "alive", blank: false, label: "EH.Death.Status.Label"}),
					success: new foundry.data.fields.NumberField({
						nullable: false, initial: 0, min: 0, integer: true, label: "EH.Death.Success"
					}),
					failure: new foundry.data.fields.NumberField({
						nullable: false, initial: 0, min: 0, integer: true, label: "EH.Death.Failure"
					}),
					bonus: new FormulaField({label: "EH.Death.Bonus"}),
					overrides: new foundry.data.fields.SchemaField({
						success: new foundry.data.fields.NumberField({label: "EH.Death.Override.Success"}),
						failure: new foundry.data.fields.NumberField({label: "EH.Death.Override.Failure"}),
						target: new foundry.data.fields.NumberField({label: "EH.Death.Override.Target"})
					})
				}, {label: "EH.Death.Label[other]"}),
				defense: new foundry.data.fields.SchemaField({
					bonus: new FormulaField({deterministic: true, label: "Defense.Bonus.Label"})
				}, {label: "Defense.Label"}),
				hd: new foundry.data.fields.SchemaField({
					spent: new foundry.data.fields.NumberField({initial: 0, min: 0, integer: true, label: "EH.HitDice.Spent"})
				}, {label: "EH.HitDice.Labe[other]"}),
				hp: new foundry.data.fields.SchemaField({
					value: new foundry.data.fields.NumberField({
						nullable: false, initial: 0, min: 0, integer: true, label: "EH.HitPoints.Current"
					}),
					temp: new foundry.data.fields.NumberField({
						initial: null, min: 0, integer: true, label: "EH.HitPoints.Temp"
					}),
					ability: new foundry.data.fields.StringField({
						initial: () => CONFIG.EverydayHeroes.defaultAbilities.hitPoints, label: "EH.Ability.Label[one]"
					}),
					// TODO: Does Everyday Heroes need temp max support?
					bonuses: new foundry.data.fields.SchemaField({
						level: new FormulaField({deterministic: true, label: ""}),
						overall: new FormulaField({deterministic: true, label: ""})
					})
				}, {label: ""})
			}, {label: ""}),
			biography: new foundry.data.fields.SchemaField({
				value: new foundry.data.fields.HTMLField({label: "EH.Biography.Label"}),
				public: new foundry.data.fields.HTMLField({label: "EH.Biography.Public"}),
				notes: new foundry.data.fields.HTMLField({label: "EH.Biography.Notes"}),
				attachments: new foundry.data.fields.ArrayField(
					new foundry.data.fields.StringField(), {label: "EH.Biography.Attachments"}
				),
				beliefs: new foundry.data.fields.ArrayField(
					new foundry.data.fields.StringField(), {label: "EH.Biography.Beliefs"}
				),
				flaws: new foundry.data.fields.ArrayField(
					new foundry.data.fields.StringField(), {label: "EH.Biography.Flaws"}
				),
				motivations: new foundry.data.fields.ArrayField(
					new foundry.data.fields.StringField(), {label: "EH.Biography.Motivations"}
				),
				quirks: new foundry.data.fields.ArrayField(
					new foundry.data.fields.StringField(), {label: "EH.Biography.Quirks"}
				),
				virtues: new foundry.data.fields.ArrayField(
					new foundry.data.fields.StringField(), {label: "EH.Biography.Virtues"}
				),
				age: new foundry.data.fields.StringField({label: "EH.Biography.Age"}),
				ancestry: new foundry.data.fields.StringField({label: "EH.Biography.Ancestry"}),
				eyes: new foundry.data.fields.StringField({label: "EH.Biography.Eyes"}),
				hair: new foundry.data.fields.StringField({label: "EH.Biography.Hair"}),
				height: new foundry.data.fields.StringField({label: "EH.Biography.Height"}),
				marital: new foundry.data.fields.StringField({label: "EH.Biography.MaritalStatus"}),
				pronouns: new foundry.data.fields.StringField({label: "EH.Biography.Pronouns"}),
				role: new foundry.data.fields.StringField({label: "EH.Biography.Role"}),
				skin: new foundry.data.fields.StringField({label: "EH.Biography.Skin"}),
				weight: new foundry.data.fields.StringField({label: "EH.Biography.Weight"})
			}),
			bonuses: new foundry.data.fields.SchemaField({
				attack: new MappingField(new FormulaField()),
				damage: new MappingField(new FormulaField())
			}, {label: ""}),
			conditions: new MappingField(new foundry.data.fields.NumberField({
				min: 0, integer: true
			}), {label: ""}),
			details: new foundry.data.fields.SchemaField({
				level: new foundry.data.fields.NumberField({
					nullable: false, initial: 1, min: 1, max: CONFIG.EverydayHeroes.maxLevel, integer: true, label: ""
				}),
				wealth: new foundry.data.fields.SchemaField({
					bonus: new foundry.data.fields.NumberField({integer: true, label: "EH.Details.Wealth.Bonus.Label"})
				}, {label: "EH.Details.Wealth.Label"})
			}),
			inspiration: new foundry.data.fields.BooleanField({label: "EH.Resource.Inspiration"}),
			items: new MappingField(new foundry.data.fields.SchemaField({
				ammunition: new foundry.data.fields.ForeignDocumentField(foundry.documents.BaseItem, {idOnly: true, label: ""}),
				equipped: new foundry.data.fields.BooleanField({label: ""}),
				mode: new foundry.data.fields.StringField({label: ""})
			})),
			overrides: new foundry.data.fields.SchemaField({
				abilities: new foundry.data.fields.SchemaField({
					melee: new foundry.data.fields.StringField({label: ""}),
					ranged: new foundry.data.fields.StringField({label: ""})
				}),
				criticalThreshold: new MappingField(new foundry.data.fields.NumberField({initial: 20, min: 1, integer: true}))
			}, {label: ""}),
			traits: new foundry.data.fields.SchemaField({
				damage: new foundry.data.fields.SchemaField({
					immunity: new foundry.data.fields.SetField(new foundry.data.fields.StringField(), {
						label: "EH.Damage.Immunity.Label"
					}),
					reduction: new MappingField(new FormulaField({deterministic: true}), {label: "EH.Damage.Reduction.Label"})
				}),
				languages: new foundry.data.fields.ArrayField(new foundry.data.fields.StringField(), {
					label: "EH.Language.Label[other]"
				}),
				equipment: new foundry.data.fields.SetField(new foundry.data.fields.StringField(), {
					label: "Proficiency.Label[other]"
				})
			}, {label: ""})
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareBaseData() {
		this.attributes.hd.max = this.details.level;
		this.attributes.prof = Proficiency.calculateMod(this.details.level);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedDetails() {
		for ( const item of this.parent.items ) {
			// TODO: Add actor warning if more than one archetype, class, background, or profession exist
			switch (item.type) {
				case "archetype":
					this.details.archetype = item;
					break;
				case "class":
					this.details.class = item;
					break;
				case "background":
					this.details.background = item;
					break;
				case "profession":
					this.details.profession = item;
					break;
			}
		}
		this.details.wealth.value = (this.details.profession?.system.wealth ?? 0) + this.details.wealth.bonus;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedDefense() {
		const archetype = this.details.archetype?.system.defense;
		const defense = this.attributes.defense ??= {};

		const highestAbility = { key: undefined, mod: -Infinity };
		for ( const abilityKey of (archetype?.abilities ?? []) ) {
			const ability = this.abilities[abilityKey];
			if ( !ability || ability.mod <= highestAbility.mod ) continue;
			highestAbility.key = abilityKey;
			highestAbility.mod = ability.mod;
		}
		if ( !highestAbility.key ) {
			highestAbility.key = CONFIG.EverydayHeroes.defaultAbilities.defense;
			highestAbility.mod = this.abilities[CONFIG.EverydayHeroes.defaultAbilities.defense]?.mod ?? 0;
		}

		defense.ability = highestAbility.key;
		defense.bonus = simplifyBonus(this.attributes.defense.bonus, this.parent.getRollData()) + (archetype?.bonus ?? 0);
		defense.value = 10 + highestAbility.mod + defense.bonus;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedHitDice() {
		const hd = this.attributes.hd;
		hd.available = Math.clamped(0, hd.max - hd.spent, hd.max);
		hd.denomination = this.details.archetype?.system.hitDie;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedHitPoints() {
		const rollData = this.parent.getRollData();
		const hp = this.attributes.hp;
		const abilityId = CONFIG.EverydayHeroes.defaultAbilities.hitPoints ?? "con";
		const abilityMod = this.abilities[abilityId]?.mod ?? 0;
		const base = this.details.archetype?.system.advancement.byType("HitPoints")[0]?.getAdjustedTotal(abilityMod) ?? 0;
		const levelBonus = simplifyBonus(hp.bonuses.level, rollData) * this.details.level;
		const overallBonus = simplifyBonus(hp.bonuses.overall, rollData);
		hp.max = base + levelBonus + overallBonus;
		hp.damage = hp.max - hp.value;
	}
}
