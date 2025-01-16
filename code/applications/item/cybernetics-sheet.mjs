import FeatureSheet from "./feature-sheet.mjs";

/**
 * Sheet representing a Cybernetic enhancement.
 */
export default class CyberneticsSheet extends FeatureSheet {
	static get defaultOptions() {
		const options = foundry.utils.mergeObject(super.defaultOptions, {
			template: "systems/everyday-heroes/templates/item/cybernetics-sheet.hbs"
		});
		options.classes.push("cybernetics");
		return options;
	}
}
