import MappingField from "../fields/mapping-field.mjs";
import TypeField from "../fields/type-field.mjs";

/**
 * Configuration data for the Scale Value advancement type.
 *
 * @property {string} type - Type of data represented by this scale value.
 * @property {Object<string, *>} scale - Scale values for each level. Value format is determined by type.
 */
export class ScaleValueConfigurationData extends foundry.abstract.DataModel {
	static defineSchema() {
		return {
			type: new foundry.data.fields.StringField({
				required: true, initial: "string", choices: TYPES, label: "EH.Advancement.ScaleValue.Type.Label"
			}),
			scale: new MappingField(new TypeField({
				determineType: (_, parent) => parent?.type, modelLookup: type => TYPES[type]
			}), {required: true, label: "EH.Advancement.ScaleValue.Values.Label"})
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static migrateData(source) {
		super.migrateData(source);
		Object.values(source.scale ?? {}).forEach(v => TYPES[source.type]?.migrateData(v));
	}
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Scale Value Types                        */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Base scale value data type that stores generic string values.
 *
 * @property {string} value  String value.
 */
export class ScaleValueType extends foundry.abstract.DataModel {
	static defineSchema() {
		return {
			value: new foundry.data.fields.StringField({required: true})
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Information on how a scale value of this type is configured.
	 *
	 * @typedef {object} ScaleValueTypeMetadata
	 * @property {string} label - Name of this type.
	 * @property {string} hint - Hint for this type shown in the scale value configuration.
	 * @property {boolean} isNumeric - When using the default editing interface, should numeric inputs be used?
	 * @property {boolean} validResource - Can this scale value type be used for resources?
	 */

	/**
	 * Configuration information for this scale value type.
	 * @type {ScaleValueTypeMetadata}
	 */
	static get metadata() {
		return {
			label: "EH.Advancement.ScaleValue.Type.Generic.Label",
			hint: "EH.Advancement.ScaleValue.Type.Generic.Hint",
			isNumeric: false,
			validResource: false
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Attempt to convert another scale value type to this one.
	 * @param {ScaleValueType} original - Original type to attempt to convert.
	 * @param {object} [options] - Options which affect DataModel construction.
	 * @returns {ScaleValueType|null}
	 */
	static convertFrom(original, options) {
		return new this({value: original.formula}, options);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * This scale value prepared to be used in roll formulas.
	 * @type {string|null}
	 */
	get formula() { return this.value; }

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * This scale value formatted for display.
	 * @type {string|null}
	 */
	get display() { return this.formula; }

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Shortcut to the prepared value when used in roll formulas.
	 * @returns {string}
	 */
	toString() {
		return this.formula;
	}
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Scale value data type that stores numeric values.
 *
 * @property {number} value - Numeric value.
 */
export class ScaleValueTypeNumber extends ScaleValueType {
	static defineSchema() {
		return {
			value: new foundry.data.fields.NumberField({required: true})
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static get metadata() {
		return foundry.utils.mergeObject(super.metadata, {
			label: "EH.Advancement.ScaleValue.Type.Number.Label",
			hint: "EH.Advancement.ScaleValue.Type.Number.Hint",
			isNumeric: true,
			validResource: true
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static convertFrom(original, options) {
		const value = Number(original.formula);
		if ( Number.isNaN(value) ) return null;
		return new this({value}, options);
	}
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Scale value data type that stores dice values.
 *
 * @property {number} number - Number of dice.
 * @property {number} denomination - Denomination of the die.
 */
export class ScaleValueTypeDice extends ScaleValueType {
	static defineSchema() {
		return {
			number: new foundry.data.fields.NumberField({nullable: true, integer: true, min: 1}),
			denomination: new foundry.data.fields.NumberField({
				nullable: true, initial: () => CONFIG.EverydayHeroes.diceSteps[0], integer: true
			})
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static get metadata() {
		return foundry.utils.mergeObject(super.metadata, {
			label: "EH.Advancement.ScaleValue.Type.Dice.Label",
			hint: "EH.Advancement.ScaleValue.Type.Dice.Hint",
			validResource: true
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * List of die faces that can be chosen.
	 * @type {number[]}
	 */
	static FACES = [2, 3, 4, 6, 8, 10, 12, 20, 100];

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static convertFrom(original, options) {
		const [number, denomination] = (original.formula ?? "").split("d");
		if ( !denomination || !Number.isNumeric(number) || !Number.isNumeric(denomination) ) return null;
		return new this({number: Number(number) || null, denomination: Number(denomination)}, options);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get formula() {
		if ( !this.denomination ) return null;
		return `${this.number ?? ""}${this.die}`;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * The die value to be rolled with the leading "d" (e.g. "d4").
	 * @type {string}
	 */
	get die() {
		if ( !this.denomination ) return "";
		return `d${this.denomination}`;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static migrateData(source) {
		if ( source.denomination === 0 ) source.denomination = null;
	}
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * The available types of scaling value.
 * @enum {ScaleValueType}
 */
export const TYPES = {
	string: ScaleValueType,
	number: ScaleValueTypeNumber,
	dice: ScaleValueTypeDice
};
