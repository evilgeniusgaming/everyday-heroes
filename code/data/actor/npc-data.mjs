import NPCSheet from "../../applications/actor/npc-sheet.mjs";
import SystemDataModel from "../abstract/system-data-model.mjs";
import DocumentContextField from "../fields/document-context-field.mjs";
import FormulaField from "../fields/formula-field.mjs";
import LocalDocumentField from "../fields/local-document-field.mjs";
import MappingField from "../fields/mapping-field.mjs";
import Proficiency from "../../documents/proficiency.mjs";
import AbilitiesTemplate from "./templates/abilities-template.mjs";
import ConditionsTemplate from "./templates/conditions-template.mjs";
import DriverTemplate from "./templates/driver-template.mjs";
import InitiativeTemplate from "./templates/initiative-template.mjs";
import MovementTemplate from "./templates/movement-template.mjs";
import SizeTemplate from "./templates/size-template.mjs";
import SkillsTemplate from "./templates/skills-template.mjs";

/**
 * Data definition for NPC actors.
 * @mixes {@link AbilitiesTemplate}
 * @mixes {@link ConditionsTemplate}
 * @mixes {@link DriverTemplate}
 * @mixes {@link InitiativeTemplate}
 * @mixes {@link MovementTemplate}
 * @mixes {@link SizeTemplate}
 * @mixes {@link SkillsTemplate}
 */
export default class NPCData extends SystemDataModel.mixin(
	AbilitiesTemplate, ConditionsTemplate, DriverTemplate, InitiativeTemplate,
	MovementTemplate, SizeTemplate, SkillsTemplate
) {

	static metadata = {
		type: "npc",
		category: "person",
		localization: "EH.Actor.Type.NPC",
		image: "systems/everyday-heroes/artwork/svg/actors/npc.svg",
		sheet: {
			application: NPCSheet,
			label: "EH.Sheet.NPC"
		}
	};

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			attributes: new foundry.data.fields.SchemaField({
				defense: new foundry.data.fields.NumberField({initial: 10, min: 0, integer: true, label: "EH.Defense.Label"}),
				hd: new foundry.data.fields.SchemaField({
					count: new foundry.data.fields.NumberField({label: ""}),
					denomination: new foundry.data.fields.NumberField({positive: true, integer: true, label: "EH.Dice.Denomination"}),
					spent: new foundry.data.fields.NumberField({initial: 0, min: 0, integer: true, label: "EH.HitDice.Spent"})
				}, {label: "EH.HitDice.Labe[other]"}),
				hp: new foundry.data.fields.SchemaField({
					value: new foundry.data.fields.NumberField({
						nullable: false, initial: 0, min: 0, integer: true, label: "EH.HitPoints.Current"
					}),
					max: new foundry.data.fields.NumberField({
						min: 0, integer: true, label: "EH.HitPoints.Max"
					}),
					temp: new foundry.data.fields.NumberField({
						initial: null, min: 0, integer: true, label: "EH.HitPoints.Temp"
					}),
					formula: new FormulaField({label: "EH.HitPoints.Formula"})
					// TODO: Determine if this would be better handed directly from the hit dice
				}, {label: "EH.HitPoints.Label[other]"}),
				senses: new foundry.data.fields.ArrayField(new foundry.data.fields.StringField(), {
					label: "EH.Sense.Label[other]"
				})
			}, {label: "EH.Attributes.Label"}),
			biography: new foundry.data.fields.SchemaField({
				value: new foundry.data.fields.HTMLField({label: "EH.Biography.Label"}),
				public: new foundry.data.fields.HTMLField({label: "EH.Biography.Public"}),
				roles: new foundry.data.fields.ArrayField(new foundry.data.fields.StringField(), {label: "EH.Role.Label[other]"})
			}, {label: "EH.Biography.Label"}),
			details: new foundry.data.fields.SchemaField({
				cr: new foundry.data.fields.NumberField({initial: 0, min: 0, label: "EH.ChallengeRating.Label"})
			}, {label: "EH.Details.Label"}),
			items: new DocumentContextField(foundry.documents.BaseItem, {
				ammunition: new LocalDocumentField(foundry.documents.BaseItem),
				equipped: new foundry.data.fields.BooleanField({initial: true, label: "EH.Item.State.Equipped"}),
				mode: new foundry.data.fields.StringField({label: "EH.Item.Mode"})
			}),
			overrides: new foundry.data.fields.SchemaField({
				critical: new foundry.data.fields.SchemaField({
					multiplier: new foundry.data.fields.NumberField({
						min: 1, integer: true, label: "EH.Action.Override.Critical.Multiplier.Label"
					}),
					threshold: new MappingField(new foundry.data.fields.NumberField({initial: 20, min: 1, integer: true}), {
						label: "Weapon.Overrides.Critical.Threshold.Label"
					})
				})
			}, {label: "EH.Override.Label"}),
			resources: new MappingField(new foundry.data.fields.SchemaField({
				label: new foundry.data.fields.StringField({label: "EH.Resource.Label.Label"}),
				spent: new foundry.data.fields.NumberField({initial: 0, min: 0, label: "EH.Resource.Spent.Label"}),
				max: new foundry.data.fields.NumberField({initial: 0, min: 0, label: "EH.Resource.Max.Label"}),
				denomination: new foundry.data.fields.NumberField({initial: null, integer: true, label: "EH.Dice.Denomination"}),
				recovery: new foundry.data.fields.SchemaField({
					period: new foundry.data.fields.StringField({label: "EH.Uses.Recovery.Period.Label"}),
					formula: new FormulaField({label: "EH.Uses.Recovery.Formula.Label"})
				})
			}), {label: "EH.Resource.Label[other]"}),
			traits: new foundry.data.fields.SchemaField({
				damage: new foundry.data.fields.SchemaField({
					immunity: new foundry.data.fields.SetField(new foundry.data.fields.StringField(), {
						label: "EH.Damage.Immunity.Label"
					}),
					reduction: new MappingField(new FormulaField({deterministic: true}), {label: "EH.Damage.Reduction.Label"})
				}),
				type: new foundry.data.fields.SchemaField({
					value: new foundry.data.fields.StringField({initial: "person", label: "EH.Creature.Type.Label"}),
					tags: new foundry.data.fields.ArrayField(new foundry.data.fields.StringField(), {
						label: "EH.Creature.Type.Tags.Label"
					})
				}, {label: "EH.Creature.Type.Label"})
			}, {label: "EH.Traits.Label"})
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareBaseDetails() {
		this.attributes.prof = Proficiency.calculateMod(Math.max(this.details.cr, 1));
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedHitPoints() {
		const hp = this.attributes.hp;
		hp.value = Math.clamped(hp.value, 0, hp.max);
		hp.damage = hp.max - hp.value;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedResources() {
		for ( const resource of Object.values(this.resources) ) {
			resource.available = Math.clamped(resource.max - resource.spent, 0, resource.max);
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedTypeLabel() {
		const listFormatter = new Intl.ListFormat(game.i18n.lang, {type: "unit", style: "short"});
		const allTags = Object.values(CONFIG.EverydayHeroes.creatureTypes).reduce((obj, data) => {
			if ( data.subtypes ) obj = { ...obj, ...data.subtypes };
			return obj;
		}, {});
		this.traits.type.tagList = listFormatter.format(this.traits.type.tags.map(t => (allTags[t] ?? t).toLowerCase()));
		this.traits.type.label = `${
			CONFIG.EverydayHeroes.sizes[this.traits.size]?.label ?? ""} ${
			CONFIG.EverydayHeroes.creatureTypes[this.traits.type.value]?.label ?? ""}`;
		if ( this.traits.type.tags.length ) this.traits.type.label += ` (${this.traits.type.tagList})`;
	}
}
