import ScaleValueConfig from "../../applications/advancement/scale-value-config.mjs";
import ScaleValueFlow from "../../applications/advancement/scale-value-flow.mjs";
import { ScaleValueConfigurationData, TYPES } from "../../data/advancement/scale-value-data.mjs";
import Advancement from "./advancement.mjs";

/**
 * Advancement that represents a value that scales with character level.
 */
export default class ScaleValueAdvancement extends Advancement {

	static get metadata() {
		return foundry.utils.mergeObject(super.metadata, {
			dataModels: {
				configuration: ScaleValueConfigurationData
			},
			order: 60,
			icon: "systems/everyday-heroes/artwork/svg/advancement/scale-value.svg",
			title: game.i18n.localize("EH.Advancement.ScaleValue.Title"),
			hint: game.i18n.localize("EH.Advancement.ScaleValue.Hint"),
			identifier: {
				configurable: true,
				hint: "EH.Advancement.ScaleValue.IdentifierHint"
			},
			multiLevel: true,
			apps: {
				config: ScaleValueConfig,
				flow: ScaleValueFlow
			}
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * The available types of scaling value.
	 * @enum {ScaleValueType}
	 */
	static TYPES = TYPES;

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Instance Properties                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get levels() {
		return Array.from(Object.keys(this.configuration.scale).map(l => Number(l)));
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Display Methods                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	titleForLevel(level, { configMode=false }={}) {
		const value = this.valueForLevel(level)?.display;
		if ( !value ) return this.title;
		return `${this.title}: <strong>${value}</strong>`;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Scale value for the given level.
	 * @param {number} level - Level for which to get the scale value.
	 * @returns {ScaleValueType} - Scale value at the given level or null if none exists.
	 */
	valueForLevel(level) {
		const key = Object.keys(this.configuration.scale).reverse().find(l => Number(l) <= level);
		return this.configuration.scale[key];
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Compare two scaling values and determine if they are equal.
	 * @param {*} a
	 * @param {*} b
	 * @returns {boolean}
	 */
	testEquality(a, b) {
		const keys = Object.keys(a ?? {});
		if ( keys.length !== Object.keys(b ?? {}).length ) return false;
		for ( const k of keys ) {
			if ( a[k] !== b[k] ) return false;
		}
		return true;
	}
}
