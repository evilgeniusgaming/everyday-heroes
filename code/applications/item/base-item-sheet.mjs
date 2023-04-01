/**
 * Base sheet that provides common features for Hero and NPC sheets.
 */
export default class BaseItemSheet extends ItemSheet {

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			tabs: [{navSelector: 'nav[data-group="primary"]', contentSelector: "main", initial: "description"}],
			dragDrop: [
				{dragSelector: "[data-effect-id]", dropSelector: '[data-tab="effects"]'},
				{dragSelector: "[data-advancement-id]", dropSelector: '[data-tab="advancement"]'}
			],
			width: 570,
			height: 500
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Fields that will be enriched during data preparation.
	 * @type {object}
	 */
	static enrichedFields = {
		description: "system.description.value",
		chat: "system.description.chat"
	};

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Which editor is currently visible on the biography tab.
	 * @type {string}
	 */
	editorSelected = "description";

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Context Preparation                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async getData(options) {
		const context = await super.getData(options);

		context.CONFIG = CONFIG.EverydayHeroes;
		context.system = context.item.system;
		context.source = context.item.system.toObject();

		const enrichmentContext = {
			secrets: this.item.isOwner, rollData: this.item.getRollData(), async: true, relativeTo: this.item
		};
		context.enriched = {};
		for ( const [key, path] of Object.entries(this.constructor.enrichedFields) ) {
			context.enriched[key] = await TextEditor.enrichHTML(foundry.utils.getProperty(context, path), enrichmentContext);
		}
		context.editorSelected = this.editorSelected;

		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Action Handlers                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_onChangeInput(event) {
		super._onChangeInput(event);

		// Change selected biography editor
		if ( event.target.name === "editorSelected" ) {
			this.editorSelected = event.target.value;
			this.render();
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Drag & Drop                              */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_onDragStart(event) {
		if ( event.target.classList.contains("content-link") ) return;

		// Create drag data
		const dragData = this._prepareDraggedData(event);
		if ( !dragData ) return;

		// Set data transfer
		event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare the data for a drag event.
	 * @param {DragEvent} event - The triggering DragEvent.
	 * @returns {object|void}
	 */
	_prepareDraggedData(event) {
		if ( !event.currentTarget.dataset.effectId ) return;
		return this.item.effects.get(event.currentTarget.dataset.effectId)?.toDragData();
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_onDrop(event) {
		const data = TextEditor.getDragEventData(event);

		/**
		 * A hook event that fires when some useful data is dropped onto a ConceptSheet.
		 * @function everydayHeroes.dropItemSheetData
		 * @memberof hookEvents
		 * @param {ItemEH} item - The item it was dropped upon.
		 * @param {ConceptSheet} sheet - The sheet where the drop occurred.
		 * @param {object} data - The data that has been dropped onto the sheet.
		 * @returns {boolean} - Explicitly return `false` to prevent normal drop handling.
		 */
		if ( Hooks.call("everydayHeroes.dropItemSheetData", this.item, this, data) === false ) return;

		this._handleDroppedData(event, data);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle dropped data.
	 * @param {DragEvent} event - The concluding DragEvent which contains drop data.
	 * @param {object} data - The data transfer extracted from the event.
	 */
	_handleDroppedData(event, data) {
		if ( data.type === "ActiveEffect" ) this._onDropActiveEffect(event, data);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle the dropping of ActiveEffect data onto the active effects tab.
	 * @param {DragEvent} event - The concluding DragEvent which contains drop data.
	 * @param {object} data - The data transfer extracted from the event.
	 * @returns {Promise<ActiveEffect|boolean>} - The created ActiveEffect object or false if it couldn't be created.
	 * @protected
	 */
	async _onDropActiveEffect(event, data) {
		const effect = await ActiveEffect.implementation.fromDropData(data);
		if ( !this.item.isOwner || !effect ) return false;
		if ( (this.item.uuid === effect.parent.uuid) || (this.item.uuid === effect.origin) ) return false;
		return ActiveEffect.create({
			...effect.toObject(),
			origin: this.item.uuid
		}, {parent: this.item});
	}
}
