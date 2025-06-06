import AdvancementManager from "../../advancement/advancement-manager.mjs";

/**
 * Application for selecting a archetype, class, origin, background, or profession for a hero.
 */
export default class ConceptSelectionDialog extends DocumentSheet {
	constructor(document, type, options={}) {
		super(document, options);
		this.type = type;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["everyday-heroes", "concept-selection"],
			template: "systems/everyday-heroes/templates/actor/dialogs/concept-selection-dialog.hbs",
			sheetConfig: false,
			width: 650
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get title() {
		const type = game.i18n.localize(CONFIG.Item.typeLabels[this.type]);
		return `${game.i18n.format("EH.ConceptSelection.Title", { type })}: ${this.document.name}`;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Concept document type to select.
	 * @type {string}
	 */
	type;

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Rendering                                */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async getData(options={}) {
		const context = await super.getData(options);
		let archetypeIdentifier;
		if ( this.type === "class" ) {
			archetypeIdentifier = this.document.system.details.archetype?.identifier;
			if ( !archetypeIdentifier ) {
				context.noArchetype = true;
				return context;
			}
		}

		context.items = [];
		for ( const item of await CONFIG.EverydayHeroes.registration.listSources(this.type) ) {
			if ( archetypeIdentifier && item.system.identifier.archetype !== archetypeIdentifier ) continue;
			context.items.push({
				item,
				description: await foundry.applications.ux.TextEditor.implementation.enrichHTML(item.system.description.value, {
					async: true,
					relativeTo: item,
					secrets: false
				})
			});
		}
		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Event Listeners & Handlers               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	activateListeners(jQuery) {
		super.activateListeners(jQuery);
		const [html] = jQuery;

		for ( const element of html.querySelectorAll(".collapsible-control") ) {
			element.addEventListener("click", event => {
				event.target.closest(".collapsible").classList.toggle("collapsed");
			});
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async _updateObject(event, formData) {
		const uuid = event.submitter?.dataset.uuid;
		const item = await fromUuid(uuid);
		if ( !item ) return;

		const itemData = item.toObject();
		if ( itemData.system.advancement?.length ) {
			const manager = AdvancementManager.forNewItem(this.document, itemData);
			if ( manager.steps.length ) return manager.render(true);
		}
		this.document.createEmbeddedDocuments("Item", [itemData]);
	}
}
