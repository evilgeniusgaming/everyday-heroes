import ConditionSheet from "../../applications/item/condition-sheet.mjs";
import { numberFormat } from "../../utils.mjs";
import SystemDataModel from "../abstract/system-data-model.mjs";
import IdentifierField from "../fields/identifier-field.mjs";
import LocalDocumentField from "../fields/local-document-field.mjs";
import DescribedTemplate from "./templates/described-template.mjs";
import TypedTemplate from "./templates/typed-template.mjs";

/**
 * Information on a specific condition level.
 *
 * @typedef {object} LevelData
 * @property {string} description - Description of this level's effects.
 * @property {ActiveEffectEH} effect - Effect that will be applied to an actor.
 */

/**
 * Data definition for Conditions.
 * @mixes {@link DescribedTemplate}
 * @mixes {@link TypedTemplate}
 *
 * @property {object} identifier
 * @property {string} identifier.value - Identifier of this condition.
 * @property {LevelData[]} levels - Various levels of this condition.
 */
export default class ConditionData extends SystemDataModel.mixin(DescribedTemplate, TypedTemplate) {

	static get metadata() {
		return {
			type: "condition",
			category: "meta",
			localization: "EH.Item.Type.Condition",
			icon: "fa-solid fa-explosion",
			image: "systems/everyday-heroes/artwork/svg/items/condition.svg",
			register: true,
			sheet: {
				application: ConditionSheet,
				label: "EH.Sheet.Condition"
			}
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			type: new foundry.data.fields.SchemaField({
				value: new foundry.data.fields.StringField({initial: "single", suggestions: CONFIG.EverydayHeroes.conditionTypes})
			}),
			identifier: new foundry.data.fields.SchemaField({
				value: new IdentifierField({label: "EH.Identifier.Label"})
			}),
			levels: new foundry.data.fields.ArrayField(new foundry.data.fields.SchemaField({
				description: new foundry.data.fields.HTMLField(),
				effect: new LocalDocumentField(foundry.documents.BaseActiveEffect)
			}), {label: "EH.Condition.Level.Label[other]"})
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedLevels() {
		for ( const [index, level] of this.levels.entries() ) {
			level.number = index + 1;
			level.label = this._levelLabel(level.number);
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Helpers                                  */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Adjust the number of levels to the provided number.
	 * @param {number} count - Number of levels after adjustment.
	 */
	async changeLevels(count) {
		const initialLength = this.levels.length;
		const delta = count - initialLength;
		if ( !delta || !Number.isNumeric(count) ) return;
		if ( count < 1 ) throw new Error("Must have at least one level on a condition.");
		const updates = {};

		// If count is 1, change type to "Single"
		if ( count === 1 ) updates["system.type.value"] = "single";

		let levels = this.toObject().levels;
		if ( delta > 0 ) {
			const effectData = Array.fromRange(delta).map(i => this._effectCreationData(this.levels.length + i + 1));
			const createdEffects = await this.parent.createEmbeddedDocuments("ActiveEffect", effectData);
			createdEffects.forEach(e => levels.push({effect: e.id}));
		} else {
			levels = levels.slice(0, count);
			// TODO: Delete effects
		}
		updates["system.levels"] = levels;

		await this.parent.update(updates);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Create a new Active Effect for a level.
	 * @param {number} levelIndex - Index of the level for which the effect should be created.
	 * @returns {Promise<ActiveEffect>}
	 */
	async createEffect(levelIndex) {
		const level = this.levels[levelIndex];
		if ( !level ) throw new Error(`No level exists at index ${levelIndex}, cannot create an effect.`);
		if ( level.effect ) throw new Error(`Level at index ${levelIndex} already has an associated effect.`);
		const data = this._effectCreationData(levelIndex + 1);
		const effect = (await this.parent.createEmbeddedDocuments("ActiveEffect", [data]))[0];
		const levelsCollection = this.toObject().levels;
		levelsCollection[levelIndex].effect = effect.id;
		await this.parent.update({"system.levels": levelsCollection});
		return effect;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Build the initial data used to construct an Active Effect for a specific level.
	 * @param {number} number - Number of the level for which the effect should be created.
	 * @returns {object}
	 * @internal
	 */
	_effectCreationData(number) {
		return {
			name: `${this.parent.name}${this.type.value !== "single" ? ` (${this._levelLabel(number).toLowerCase()})` : ""}`,
			icon: this.parent.img,
			"flags.everyday-heroes": {
				type: "condition",
				level: number
			}
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Create a label for a level.
	 * @param {number} number - Number of the level for which the label should be created.
	 * @returns {string}
	 * @internal
	 */
	_levelLabel(number) {
		const key = `EH.Number[${number}]`;
		return game.i18n.format("EH.Condition.Level.LabelSpecific", {
			number: game.i18n.has(key) ? game.i18n.localize(key).capitalize() : numberFormat(number)
		});
	}
}
