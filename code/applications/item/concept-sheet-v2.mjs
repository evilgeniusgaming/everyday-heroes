import { createFormOptions } from "../../utils.mjs";
import BaseItemSheetV2 from "./base-item-sheet-v2.mjs";

/**
 * Sheet that represents Archetype, Class, Background, and Profession items.
 */
export default class ConceptSheetV2 extends BaseItemSheetV2 {
	/** @override */
	static DEFAULT_OPTIONS = {
		classes: ["concept"]
	};

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Rendering                                */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @inheritDoc */
	async _prepareHeaderContext(context, options) {
		context = await super._prepareHeaderContext(context, options);

		if ( "archetype" in (this.item.system.identifier ?? {}) ) {
			context.headerFields.push(this._createFormField(context, "identifier.archetype", {
				hint: false,
				options: createFormOptions(CONFIG.EverydayHeroes.registration.all.archetype)
			}));
		}

		if ( "wealth" in this.item.system ) {
			context.headerFields.push(this._createFormField(context, "wealth", { hint: false }));
		}

		return context;
	}
}
