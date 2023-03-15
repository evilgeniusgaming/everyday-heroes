import { TYPES as ScaleValueType } from "../../advancement/scale-value-data.mjs";
import MappingField from "../../fields/mapping-field.mjs";

/**
 * @typedef {ResourceConfiguration} ResourceData
 * @property {number} spent - How many uses of this resource have been spent?
 */

/**
 * Data model template for actors that have resources (aka influence, genius, etc.).
 * @mixin
 *
 * @property {Object<string, ResourceData>} resources - Resources available (e.g. Genius or Focus).
 */
export default class ResourcesTemplate extends foundry.abstract.DataModel {
	static defineSchema() {
		return {
			resources: new MappingField(new foundry.data.fields.SchemaField({
				spent: new foundry.data.fields.NumberField({initial: 0, min: 0, label: ""})
			}), {label: "EH.Resource.Label[other]", initialKeys: CONFIG.EverydayHeroes.resources, prepareKeys: true})
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedResources() {
		for ( const resource of Object.values(this.resources) ) {
			// Set up initial values
			const adv = resource.advancement;
			if ( adv ) {
				if ( !resource.label ) resource.label = adv.title;
				if ( !resource.backdrop ) resource.backdrop = adv.configuration.backdrop;
				resource.recovery ??= {};
				if ( !resource.recovery.period ) resource.recovery.period = adv.configuration.recovery.period;
				if ( !resource.recovery.formula ) resource.recovery.formula = adv.configuration.recovery.formula;
			}

			// Dice scale value, set max to dice number
			if ( resource.scale instanceof ScaleValueType.dice ) {
				resource.max = resource.scale.number;
				resource.denomination = resource.scale.denomination;
			}

			// Numeric scale value, set max to value
			else if ( resource.scale?.constructor.metadata.isNumeric ) {
				resource.max = resource.scale.value;
			}

			// No scale value found, or not a valid type
			else {
				resource.disabled = true;
				resource.max = 0;
			}

			resource.available = Math.clamped(0, resource.max - resource.spent, resource.max);
		}
	}
}
