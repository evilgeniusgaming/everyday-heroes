import { createFormOptions } from "../../utils.mjs";
import FeatureSheetV2 from "./feature-sheet-v2.mjs";

/**
 * Sheet representing a Cybernetic enhancement.
 */
export default class CyberneticsSheet extends FeatureSheetV2 {

	/** @override */
	static DEFAULT_OPTIONS = {
		classes: ["cybernetics"]
	};

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Rendering                                */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @inheritDoc */
	async _prepareDetailsContext(context, options) {
		context = await super._prepareDetailsContext(context, options);

		context.fields.splice(2, 0,
			this._createFormField(context, "location"),
			this._createFormField(context, "surgeryComplexity", {
				options: createFormOptions(CONFIG.EverydayHeroes.cyberneticsSurgeryComplexity, {
					blank: _loc("EH.Cybernetics.SurgeryComplexity.None")
				})
			}),
			{ header: { text: "EH.Activation.Label" } }
		);

		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @inheritDoc */
	async _prepareHeaderContext(context, options) {
		context = await super._prepareHeaderContext(context, options);

		context.headerFields.push({
			fields: [
				{
					fields: [
						this._createFormField(context, "price", { classes: "label-hidden", hint: false }),
						{ html: '<span class="separator">&sol;</span>' },
						this._createFormField(context, "priceLower", { classes: "label-hidden", hint: false })
					],
					group: {
						classes: "label-top",
						label: "EH.Equipment.Trait.PriceLevel.Label"
					}
				},
				this._createFormField(context, "strain", { classes: "label-top" })
			]
		});

		return context;
	}
}
