import HeroSheet from "../../applications/actor/hero-sheet.mjs";
import AdvancementConfirmationDialog from "../../applications/advancement/advancement-confirmation-dialog.mjs";
import AdvancementManager from "../../applications/advancement/advancement-manager.mjs";
import Proficiency from "../../documents/proficiency.mjs";
import SystemDataModel from "../abstract/system-data-model.mjs";
import DocumentContextField from "../fields/document-context-field.mjs";
import FormulaField from "../fields/formula-field.mjs";
import LocalDocumentField from "../fields/local-document-field.mjs";
import MappingField from "../fields/mapping-field.mjs";
import { simplifyBonus } from "../../utils.mjs";
import AbilitiesTemplate from "./templates/abilities-template.mjs";
import ConditionsTemplate from "./templates/conditions-template.mjs";
import DriverTemplate from "./templates/driver-template.mjs";
import InitiativeTemplate from "./templates/initiative-template.mjs";
import MovementTemplate from "./templates/movement-template.mjs";
import ResourcesTemplate from "./templates/resources-template.mjs";
import SkillsTemplate from "./templates/skills-template.mjs";

/**
 * Data definition for Character actors.
 * @mixes {@link AbilitiesTemplate}
 * @mixes {@link ConditionsTemplate}
 * @mixes {@link DriverTemplate}
 * @mixes {@link InitiativeTemplate}
 * @mixes {@link MovementTemplate}
 * @mixes {@link ResourcesTemplate}
 * @mixes {@link SkillsTemplate}
 *
 * @property {object} overrides
 * @property {object} overrides.ability
 * @property {Set<string>} overrides.ability.hitPoints - Abilities to consider in place of `con` for hit points.
 * @property {Set<string>} overrides.ability.melee - Abilities to consider in place of `str` for melee attacks.
 * @property {Set<string>} overrides.ability.ranged - Abilities to consider in place of `dex` for ranged attacks.
 */
export default class HeroData extends SystemDataModel.mixin(
	AbilitiesTemplate, ConditionsTemplate, DriverTemplate, InitiativeTemplate,
	MovementTemplate, ResourcesTemplate, SkillsTemplate
) {

	static metadata = {
		type: "hero",
		category: "person",
		localization: "EH.Actor.Type.Hero",
		image: "systems/everyday-heroes/artwork/svg/actors/hero.svg",
		sheet: {
			application: HeroSheet,
			label: "EH.Sheet.Hero"
		}
	};

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			attributes: new foundry.data.fields.SchemaField({
				death: new foundry.data.fields.SchemaField({
					status: new foundry.data.fields.StringField({
						initial: "alive", blank: false, label: "EH.Death.Status.Label",
						suggestions: CONFIG.EverydayHeroes.deathStatus
					}),
					success: new foundry.data.fields.NumberField({
						nullable: false, initial: 0, min: 0, integer: true,
						label: "EH.Death.Success.Label", hint: "EH.Death.Success.Hint"
					}),
					failure: new foundry.data.fields.NumberField({
						nullable: false, initial: 0, min: 0, integer: true,
						label: "EH.Death.Failure.Label", hint: "EH.Death.Failure.Hint"
					}),
					bonus: new FormulaField({label: "EH.Death.Bonus.Label", hint: "EH.Death.Bonus.Hint"}),
					overrides: new foundry.data.fields.SchemaField({
						success: new foundry.data.fields.NumberField({
							min: 0, integer: true, label: "EH.Death.Override.Success.Label", hint: "EH.Death.Override.Success.Hint"
						}),
						failure: new foundry.data.fields.NumberField({
							min: 0, integer: true, label: "EH.Death.Override.Failure.Label", hint: "EH.Death.Override.Failure.Hint"
						}),
						target: new foundry.data.fields.NumberField({
							min: 0, integer: true, label: "EH.Death.Override.Target.Label", hint: "EH.Death.Override.Target.Hint"
						})
					})
				}, {label: "EH.Death.Label[other]"}),
				defense: new foundry.data.fields.SchemaField({
					bonus: new FormulaField({deterministic: true, label: "EH.Defense.Bonus.Label", hint: "EH.Defense.Bonus.Hint"})
				}, {label: "EH.Defense.Label"}),
				hd: new foundry.data.fields.SchemaField({
					spent: new foundry.data.fields.NumberField({initial: 0, min: 0, integer: true, label: "EH.HitDice.Spent"}),
					minimum: new FormulaField({
						deterministic: true, label: "EH.HitDice.Minimum.Label", hint: "EH.HitDice.Minimum.Hint"
					}),
					recovery: new foundry.data.fields.NumberField({
						initial: 0.5, min: -1, max: 1, label: "EH.HitDice.Recovery.Label", hint: "EH.HitDice.Recovery.Hint"
					})
				}, {label: "EH.HitDice.Label[other]"}),
				hp: new foundry.data.fields.SchemaField({
					value: new foundry.data.fields.NumberField({
						nullable: false, initial: 0, min: 0, integer: true, label: "EH.HitPoints.Current"
					}),
					temp: new foundry.data.fields.NumberField({
						initial: null, min: 0, integer: true, label: "EH.HitPoints.Temp"
					}),
					bonuses: new foundry.data.fields.SchemaField({
						level: new FormulaField({
							deterministic: true, label: "EH.HitPoints.Bonus.Level.Label", hint: "EH.HitPoints.Bonus.Level.Hint"
						}),
						overall: new FormulaField({
							deterministic: true, label: "EH.HitPoints.Bonus.Overall.Label", hint: "EH.HitPoints.Bonus.Overall.Hint"
						})
					}),
					multiplier: new foundry.data.fields.NumberField({
						min: 0, label: "EH.HitPoints.Multiplier.Label", hint: "EH.HitPoints.Multiplier.Hint"
					})
				}, {label: "EH.HitPoints.Label[other]"})
			}, {label: "EH.Attributes.Label"}),
			biography: new foundry.data.fields.SchemaField({
				value: new foundry.data.fields.HTMLField({label: "EH.Biography.Full"}),
				public: new foundry.data.fields.HTMLField({label: "EH.Biography.Public"}),
				notes: new foundry.data.fields.HTMLField({label: "EH.Biography.Notes"}),
				attachments: new foundry.data.fields.ArrayField(
					new foundry.data.fields.StringField(), {label: "EH.Biography.Attachment[other]"}
				),
				beliefs: new foundry.data.fields.ArrayField(
					new foundry.data.fields.StringField(), {label: "EH.Biography.Belief[other]"}
				),
				flaws: new foundry.data.fields.ArrayField(
					new foundry.data.fields.StringField(), {label: "EH.Biography.Flaw[other]"}
				),
				motivations: new foundry.data.fields.ArrayField(
					new foundry.data.fields.StringField(), {label: "EH.Biography.Motivation[other]"}
				),
				quirks: new foundry.data.fields.ArrayField(
					new foundry.data.fields.StringField(), {label: "EH.Biography.Quirk[other]"}
				),
				virtues: new foundry.data.fields.ArrayField(
					new foundry.data.fields.StringField(), {label: "EH.Biography.Virtue[other]"}
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
			}, {label: "EH.Biography.Label"}),
			bonuses: new foundry.data.fields.SchemaField({
				attack: new MappingField(new FormulaField(), {
					label: "EH.Bonus.Global.Attack.Label", hint: "EH.Bonus.Global.Attack.Hint"
				}),
				damage: new MappingField(new FormulaField(), {
					label: "EH.Bonus.Global.Damage.Label", hint: "EH.Bonus.Global.Damage.Hint"
				})
			}, {label: "EH.Bonus.Global.Label[other]"}),
			details: new foundry.data.fields.SchemaField({
				level: new foundry.data.fields.NumberField({
					nullable: false, initial: 1, min: 1, max: CONFIG.EverydayHeroes.maxLevel, integer: true,
					label: "EH.Level.Label[one]", hint: "EH.Level.Hint"
				}),
				limits: new MappingField(new foundry.data.fields.SchemaField({
					formula: new FormulaField({label: "EH.Feature.Limit.Formula"})
				}), {label: "EH.Feature.Limit.Label", hint: "EH.Feature.Limit.Hint"}),
				wealth: new foundry.data.fields.SchemaField({
					bonus: new FormulaField({
						deterministic: true, label: "EH.Details.Wealth.Bonus.Label", hint: "EH.Details.Wealth.Bonus.Hint"
					})
				}, {label: "EH.Details.Wealth.Label"})
			}, {label: "EH.Details.Label"}),
			inspiration: new foundry.data.fields.BooleanField({label: "EH.Resource.Inspiration"}),
			items: new DocumentContextField(foundry.documents.BaseItem, {
				ammunition: new LocalDocumentField(foundry.documents.BaseItem),
				equipped: new foundry.data.fields.BooleanField({label: "EH.Item.State.Equipped"}),
				mode: new foundry.data.fields.StringField({
					label: "EH.Item.Mode.Label", hint: "EH.Item.Mode.Hint", suggestions: CONFIG.EverydayHeroes.weaponModes
				})
			}, {label: "EH.Item.Context.Label", hint: "EH.Item.Context.Hint"}),
			overrides: new foundry.data.fields.SchemaField({
				ability: new foundry.data.fields.SchemaField({
					hitPoints: new foundry.data.fields.SetField(new foundry.data.fields.StringField(), {
						label: "EH.Override.Ability.HitPoints.Label", hint: "EH.Override.Ability.HitPoints.Hint",
						suggestions: CONFIG.EverydayHeroes.abilities
					}),
					melee: new foundry.data.fields.SetField(new foundry.data.fields.StringField(), {
						label: "EH.Override.Ability.Melee.Label", hint: "EH.Override.Ability.Melee.Hint",
						suggestions: CONFIG.EverydayHeroes.abilities
					}),
					ranged: new foundry.data.fields.SetField(new foundry.data.fields.StringField(), {
						label: "EH.Override.Ability.Ranged.Label", hint: "EH.Override.Ability.Ranged.Hint",
						suggestions: CONFIG.EverydayHeroes.abilities
					})
				}, {label: "EH.Override.Ability.Label", hint: "EH.Override.Ability.Hint"}),
				critical: new foundry.data.fields.SchemaField({
					multiplier: new foundry.data.fields.NumberField({
						min: 1, integer: true, label: "EH.Action.Override.Critical.Multiplier.Label",
						hint: "EH.Action.Override.Critical.Multiplier.Hint"
					}),
					threshold: new MappingField(new foundry.data.fields.NumberField({initial: 20, min: 1, integer: true}), {
						label: "EH.Weapon.Overrides.Critical.Threshold.Label", hint: "EH.Weapon.Overrides.Critical.Threshold.GlobalHint"
					})
				})
			}, {label: "EH.Override.Label"}),
			traits: new foundry.data.fields.SchemaField({
				damage: new foundry.data.fields.SchemaField({
					immunity: new foundry.data.fields.SetField(new foundry.data.fields.StringField({
						suggestions: CONFIG.EverydayHeroes.damageTypes
					}), {
						label: "EH.Damage.Immunity.Label", hint: "EH.Damage.Immunity.Hint"
					}),
					reduction: new MappingField(new FormulaField({deterministic: true}), {
						label: "EH.Damage.Reduction.Label", hint: "EH.Damage.Reduction.Hint"
					})
				}),
				languages: new foundry.data.fields.ArrayField(new foundry.data.fields.StringField(), {
					label: "EH.Language.Label[other]"
				}),
				equipment: new foundry.data.fields.SetField(new foundry.data.fields.StringField(), {
					label: "EH.Equipment.Proficiency.Label[other]", hint: "EH.Equipment.Proficiency.Hint"
				})
			}, {label: "EH.Traits.Label"})
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareBaseDetails() {
		this.attributes.hd.max = this.details.level;
		this.attributes.prof = Proficiency.calculateMod(this.details.level);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareEmbeddedConcept() {
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
		this.attributes.hd.denomination = this.details.archetype?.system.hitDie;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedDetails() {
		this.details.wealth.value = (this.details.profession?.system.wealth ?? 0)
			+ simplifyBonus(this.details.wealth.bonus, this.parent.getRollData());
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedDefense() {
		const rollData = this.parent.getRollData();
		const archetype = this.details.archetype?.system.defense;
		const defense = this.attributes.defense;

		defense.ability = this.bestAbility(archetype?.abilities ?? new Set())
			?? CONFIG.EverydayHeroes.defaultAbilities.defense;
		const ability = this.abilities[defense.ability];

		if ( Number.isNumeric(defense.override) ) defense.bonus = Number(defense.override);
		else defense.bonus = simplifyBonus(defense.bonus, rollData) + (archetype?.bonus ?? 0);
		defense.value = 10 + (ability?.mod ?? 0) + defense.bonus;

		defense.toString = () => defense.value;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedHitDice() {
		const hd = this.attributes.hd;
		hd.available = Math.clamped(hd.max - hd.spent, 0, hd.max);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedLimits() {
		const rollData = this.parent.getRollData({deterministic: true});
		const limits = this.details.limits;
		for ( const config of CONFIG.EverydayHeroes.sheetSections[this.constructor.metadata.type] ) {
			if ( !config.options?.limited ) continue;
			const limit = limits[config.options.limited] ??= {};
			limit.value = 0;
			limit.max = simplifyBonus(limit.formula ?? "", rollData);
		}
		for ( const item of this.parent.items ) {
			const limit = limits[item.system.constructor.metadata?.type];
			if ( !limit ) continue;
			limit.value += 1;
		}
		// TODO: Add sheet warning if you exceed your maximum
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedHitPoints() {
		const rollData = this.parent.getRollData();
		const hp = this.attributes.hp;

		hp.ability = this.bestAbility(new Set([
			CONFIG.EverydayHeroes.defaultAbilities.hitPoints,
			...this.overrides.ability.hitPoints
		]));

		const base = this.details.archetype?.system.advancement.byType("HitPoints")[0]
			?.getAdjustedTotal(this.abilities[hp.ability]?.mod ?? 0) ?? 0;
		const levelBonus = simplifyBonus(hp.bonuses.level, rollData) * this.details.level;
		const overallBonus = simplifyBonus(hp.bonuses.overall, rollData);

		hp.max = Math.floor((base + levelBonus + overallBonus) * (hp.multiplier ?? 1));
		hp.value = Math.clamped(hp.value, 0, hp.max);
		hp.damage = hp.max - hp.value;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Socket Event Handlers                    */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async _preCreateToken(data, options, user) {
		if ( !data.prototypeToken ) this.parent.updateSource({prototypeToken: {actorLink: true, disposition: 1}});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async _preUpdateHP(changed, options, user) {
		const changedHP = foundry.utils.getProperty(changed, "system.attributes.hp.value");
		if ( changedHP !== undefined ) {
			if ( (changedHP > 0) || (this.attributes.hp.max === 0) ) {
				foundry.utils.setProperty(changed, "system.attributes.death.status", "alive");
				foundry.utils.setProperty(changed, "system.attributes.death.success", 0);
				foundry.utils.setProperty(changed, "system.attributes.death.failure", 0);
			} else if ( this.attributes.death.status === "alive" ) {
				foundry.utils.setProperty(changed, "system.attributes.death.status", "dying");
			}
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async _preUpdateAdvancement(changed, options, user) {
		if ( options.isAdvancement || options.noHook ) return;
		const changedLevel = foundry.utils.getProperty(changed, "system.details.level");
		const delta = changedLevel - this.details.level;
		if ( changedLevel && delta ) {
			foundry.utils.setProperty(changed, "system.details.level", this.details.level);
			this.parent.updateSource(changed);
			const manager = AdvancementManager.forLevelChange(this.parent, delta);
			if ( manager.steps.length ) {
				if ( delta > 0 ) return manager.render(true);
				try {
					const shouldRemoveAdvancements = await AdvancementConfirmationDialog.forLevelDown(this.parent);
					if ( shouldRemoveAdvancements ) return manager.render(true);
				} catch(err) { }
			}
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async _onUpdateDeathStatus(changed, options, userId) {
		if ( game.user.id !== userId ) return;

		const deathStatus = foundry.utils.getProperty(changed, "system.attributes.death.status");
		if ( deathStatus ) await this.parent.setDefeatedStatus(deathStatus === "dead");
	}
}
