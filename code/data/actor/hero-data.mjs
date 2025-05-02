import HeroSheet from "../../applications/actor/hero-sheet.mjs";
import AdvancementConfirmationDialog from "../../applications/advancement/advancement-confirmation-dialog.mjs";
import AdvancementManager from "../../applications/advancement/advancement-manager.mjs";
import Proficiency from "../../documents/proficiency.mjs";
import ActorDataModel from "../abstract/actor-data-model.mjs";
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

const { ArrayField, BooleanField, HTMLField, NumberField, SchemaField, SetField, StringField } = foundry.data.fields;

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
export default class HeroData extends ActorDataModel.mixin(
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
			attributes: new SchemaField({
				death: new SchemaField({
					status: new StringField({
						initial: "alive", blank: false, label: "EH.Death.Status.Label",
						suggestions: CONFIG.EverydayHeroes.deathStatus
					}),
					success: new NumberField({
						nullable: false, initial: 0, min: 0, integer: true,
						label: "EH.Death.Success.Label", hint: "EH.Death.Success.Hint"
					}),
					failure: new NumberField({
						nullable: false, initial: 0, min: 0, integer: true,
						label: "EH.Death.Failure.Label", hint: "EH.Death.Failure.Hint"
					}),
					bonus: new FormulaField({label: "EH.Death.Bonus.Label", hint: "EH.Death.Bonus.Hint"}),
					overrides: new SchemaField({
						success: new NumberField({
							min: 0, integer: true, label: "EH.Death.Override.Success.Label", hint: "EH.Death.Override.Success.Hint"
						}),
						failure: new NumberField({
							min: 0, integer: true, label: "EH.Death.Override.Failure.Label", hint: "EH.Death.Override.Failure.Hint"
						}),
						target: new NumberField({
							min: 0, integer: true, label: "EH.Death.Override.Target.Label", hint: "EH.Death.Override.Target.Hint"
						})
					})
				}, {label: "EH.Death.Label[other]"}),
				defense: new SchemaField({
					bonus: new FormulaField({deterministic: true, label: "EH.Defense.Bonus.Label", hint: "EH.Defense.Bonus.Hint"})
				}, {label: "EH.Defense.Label"}),
				hd: new SchemaField({
					spent: new NumberField({initial: 0, min: 0, integer: true, label: "EH.HitDice.Spent"}),
					minimum: new FormulaField({
						deterministic: true, label: "EH.HitDice.Minimum.Label", hint: "EH.HitDice.Minimum.Hint"
					}),
					recovery: new NumberField({
						initial: 0.5, min: -1, max: 1, label: "EH.HitDice.Recovery.Label", hint: "EH.HitDice.Recovery.Hint"
					})
				}, {label: "EH.HitDice.Label[other]"}),
				hp: new SchemaField({
					value: new NumberField({
						nullable: false, initial: 0, min: 0, integer: true, label: "EH.HitPoints.Current"
					}),
					temp: new NumberField({
						initial: null, min: 0, integer: true, label: "EH.HitPoints.Temp"
					}),
					bonuses: new SchemaField({
						level: new FormulaField({
							deterministic: true, label: "EH.HitPoints.Bonus.Level.Label", hint: "EH.HitPoints.Bonus.Level.Hint"
						}),
						overall: new FormulaField({
							deterministic: true, label: "EH.HitPoints.Bonus.Overall.Label", hint: "EH.HitPoints.Bonus.Overall.Hint"
						})
					}),
					multiplier: new NumberField({
						min: 0, label: "EH.HitPoints.Multiplier.Label", hint: "EH.HitPoints.Multiplier.Hint"
					})
				}, {label: "EH.HitPoints.Label[other]"})
			}, {label: "EH.Attributes.Label"}),
			biography: new SchemaField({
				value: new HTMLField({label: "EH.Biography.Full"}),
				public: new HTMLField({label: "EH.Biography.Public"}),
				notes: new HTMLField({label: "EH.Biography.Notes"}),
				attachments: new ArrayField(
					new StringField(), {label: "EH.Biography.Attachment[other]"}
				),
				beliefs: new ArrayField(
					new StringField(), {label: "EH.Biography.Belief[other]"}
				),
				flaws: new ArrayField(
					new StringField(), {label: "EH.Biography.Flaw[other]"}
				),
				motivations: new ArrayField(
					new StringField(), {label: "EH.Biography.Motivation[other]"}
				),
				quirks: new ArrayField(
					new StringField(), {label: "EH.Biography.Quirk[other]"}
				),
				virtues: new ArrayField(
					new StringField(), {label: "EH.Biography.Virtue[other]"}
				),
				age: new StringField({label: "EH.Biography.Age"}),
				ancestry: new StringField({label: "EH.Biography.Ancestry"}),
				eyes: new StringField({label: "EH.Biography.Eyes"}),
				hair: new StringField({label: "EH.Biography.Hair"}),
				height: new StringField({label: "EH.Biography.Height"}),
				marital: new StringField({label: "EH.Biography.MaritalStatus"}),
				pronouns: new StringField({label: "EH.Biography.Pronouns"}),
				role: new StringField({label: "EH.Biography.Role"}),
				skin: new StringField({label: "EH.Biography.Skin"}),
				weight: new StringField({label: "EH.Biography.Weight"})
			}, {label: "EH.Biography.Label"}),
			bonuses: new SchemaField({
				attack: new MappingField(new FormulaField(), {
					label: "EH.Bonus.Global.Attack.Label", hint: "EH.Bonus.Global.Attack.Hint"
				}),
				damage: new MappingField(new FormulaField(), {
					label: "EH.Bonus.Global.Damage.Label", hint: "EH.Bonus.Global.Damage.Hint"
				})
			}, {label: "EH.Bonus.Global.Label[other]"}),
			details: new SchemaField({
				level: new NumberField({
					nullable: false, initial: 1, min: 1, max: CONFIG.EverydayHeroes.maxLevel, integer: true,
					label: "EH.Level.Label[one]", hint: "EH.Level.Hint"
				}),
				limits: new MappingField(new SchemaField({
					formula: new FormulaField({label: "EH.Feature.Limit.Formula"})
				}), {label: "EH.Feature.Limit.Label", hint: "EH.Feature.Limit.Hint"}),
				wealth: new SchemaField({
					bonus: new FormulaField({
						deterministic: true, label: "EH.Details.Wealth.Bonus.Label", hint: "EH.Details.Wealth.Bonus.Hint"
					})
				}, {label: "EH.Details.Wealth.Label"})
			}, {label: "EH.Details.Label"}),
			inspiration: new BooleanField({label: "EH.Resource.Inspiration"}),
			items: new DocumentContextField(foundry.documents.BaseItem, {
				ammunition: new LocalDocumentField(foundry.documents.BaseItem),
				equipped: new BooleanField({label: "EH.Item.State.Equipped"}),
				mode: new StringField({
					label: "EH.Item.Mode.Label", hint: "EH.Item.Mode.Hint", suggestions: CONFIG.EverydayHeroes.weaponModes
				})
			}, {label: "EH.Item.Context.Label", hint: "EH.Item.Context.Hint"}),
			overrides: new SchemaField({
				ability: new SchemaField({
					defense: new SetField(new StringField(), {
						label: "EH.Override.Ability.Defense.Label", hint: "EH.Override.Ability.Defense.Hint",
						suggestions: CONFIG.EverydayHeroes.abilities
					}),
					hitPoints: new SetField(new StringField(), {
						label: "EH.Override.Ability.HitPoints.Label", hint: "EH.Override.Ability.HitPoints.Hint",
						suggestions: CONFIG.EverydayHeroes.abilities
					}),
					melee: new SetField(new StringField(), {
						label: "EH.Override.Ability.Melee.Label", hint: "EH.Override.Ability.Melee.Hint",
						suggestions: CONFIG.EverydayHeroes.abilities
					}),
					ranged: new SetField(new StringField(), {
						label: "EH.Override.Ability.Ranged.Label", hint: "EH.Override.Ability.Ranged.Hint",
						suggestions: CONFIG.EverydayHeroes.abilities
					})
				}, {label: "EH.Override.Ability.Label", hint: "EH.Override.Ability.Hint"}),
				critical: new SchemaField({
					multiplier: new NumberField({
						min: 1, integer: true, label: "EH.Action.Override.Critical.Multiplier.Label",
						hint: "EH.Action.Override.Critical.Multiplier.Hint"
					}),
					threshold: new MappingField(new FormulaField({initial: "20", deterministic: true}), {
						label: "EH.Weapon.Overrides.Critical.Threshold.Label", hint: "EH.Weapon.Overrides.Critical.Threshold.GlobalHint"
					})
				})
			}, {label: "EH.Override.Label"}),
			traits: new SchemaField({
				damage: new SchemaField({
					immunity: new SetField(new StringField({
						suggestions: CONFIG.EverydayHeroes.damageTypes
					}), {
						label: "EH.Damage.Immunity.Label", hint: "EH.Damage.Immunity.Hint"
					}),
					reduction: new MappingField(new FormulaField({deterministic: true}), {
						label: "EH.Damage.Reduction.Label", hint: "EH.Damage.Reduction.Hint"
					})
				}),
				languages: new ArrayField(new StringField(), {
					label: "EH.Language.Label[other]"
				}),
				equipment: new SetField(new StringField(), {
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
		this.details.backgrounds = [];
		this.details.professions = [];
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareEmbeddedConcept() {
		for ( const item of this.parent.items ) {
			switch (item.type) {
				case "origin":
					this.details.origin = item;
					break;
				case "archetype":
					this.details.archetype = item;
					break;
				case "class":
					this.details.class = item;
					break;
				case "background":
					this.details.backgrounds.push(item);
					break;
				case "profession":
					this.details.professions.push(item);
					break;
			}
		}
		this.attributes.hd.denomination = this.details.archetype?.system.hitDie;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedDetails() {
		const professionWealth = Math.max(0, ...this.details.professions.map(p => p.system.wealth ?? 0));
		this.details.wealth.value = professionWealth + simplifyBonus(this.details.wealth.bonus, this.parent.getRollData());
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedDefense() {
		const rollData = this.parent.getRollData();
		const archetype = this.details.archetype?.system.defense;
		const defense = this.attributes.defense;

		defense.ability = this.bestAbility(new Set([
			...(archetype?.abilities ?? [CONFIG.EverydayHeroes.defaultAbilities.defense]),
			...this.overrides.ability.defense
		]));
		const ability = this.abilities[defense.ability];

		if ( Number.isNumeric(defense.override) ) defense.bonus = Number(defense.override);
		else defense.bonus = simplifyBonus(defense.bonus, rollData) + (archetype?.bonus ?? 0);
		defense.value = 10 + (ability?.mod ?? 0) + defense.bonus;

		defense.toString = () => defense.value;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedHitDice() {
		const hd = this.attributes.hd;
		hd.available = Math.clamp(hd.max - hd.spent, 0, hd.max);
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
		hp.value = Math.clamp(hp.value, 0, hp.max);
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
