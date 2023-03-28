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
		const li = event.currentTarget;
		if ( event.target.classList.contains("content-link") ) return;

		// Create drag data
		let dragData;

		// Active Effect
		if ( li.dataset.effectId ) {
			dragData = this.item.effects.get(li.dataset.effectId)?.toDragData();
		}

		// Advancement
		else if ( li.dataset.advancementId ) {
			dragData = this.item.system.advancement.get(li.dataset.advancementId)?.toDragData();
		}

		if ( !dragData ) return;

		// Set data transfer
		event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_onDrop(event) {
		const data = TextEditor.getDragEventData(event);
		const item = this.item;

		/**
		 * A hook event that fires when some useful data is dropped onto a ConceptSheet.
		 * @function everydayHeroes.dropItemSheetData
		 * @memberof hookEvents
		 * @param {ItemEH} item - The item it was dropped upon.
		 * @param {ConceptSheet} sheet - The sheet where the drop occurred.
		 * @param {object} data - The data that has been dropped onto the sheet.
		 * @returns {boolean} - Explicitly return `false` to prevent normal drop handling.
		 */
		if ( Hooks.call("everydayHeroes.dropItemSheetData", item, this, data) === false ) return;

		switch ( data.type ) {
			case "ActiveEffect":
				return this._onDropActiveEffect(event, data);
			case "Advancement":
			case "Item":
				return this._onDropAdvancement(event, data);
		}
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

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle the dropping of an advancement or item with advancements onto the advancements tab.
	 * @param {DragEvent} event - The concluding DragEvent which contains drop data.
	 * @param {object} data - The data transfer extracted from the event.
	 */
	async _onDropAdvancement(event, data) {
		let advancements;
		let showDialog = false;
		if ( data.type === "Advancement" ) {
			advancements = [await fromUuid(data.uuid)];
		} else if ( data.type === "Item" ) {
			const item = await Item.implementation.fromDropData(data);
			if ( !item ) return false;
			advancements = Array.from(item.system.advancement);
			showDialog = true;
		} else {
			return false;
		}
		advancements = advancements.filter(a => {
			return !this.item.system.advancement.get(a.id)
				&& a.constructor.metadata.validItemTypes.has(this.item.type)
				&& a.constructor.availableForItem(this.item);
		});

		if ( showDialog ) {
			try {
				advancements = await AdvancementMigrationDialog.createDialog(this.item, advancements);
			} catch(error) {
				return false;
			}
		}

		if ( !advancements.length ) return false;
		if ( this.item.isEmbedded ) {
			const manager = AdvancementManager.forNewAdvancement(this.item.actor, this.item.id, advancements);
			if ( manager.steps.length ) return manager.render(true);
		}

		// If no advancements need to be applied, just add them to the item
		const advancementCollection = this.item.system.advancement.toObject();
		advancementCollection.push(...advancements.map(a => a.toObject()));
		this.item.update({"system.advancement": advancementCollection});
	}
}
