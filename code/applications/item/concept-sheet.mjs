import AdvancementItemSheet from "./advancement-item-sheet.mjs";

/**
 * Sheet that represents Archetype, Class, Background, and Profession items.
 */
export default class ConceptSheet extends AdvancementItemSheet {
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["everyday-heroes", "sheet", "concept", "item"],
			template: "systems/everyday-heroes/templates/item/concept-sheet.hbs",
			tabs: [{navSelector: 'nav[data-group="primary"]', contentSelector: "main", initial: "description"}],
			width: 570,
			height: 500
		});
	}
}
