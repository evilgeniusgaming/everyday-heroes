import ItemEH from "./item.mjs";

/**
 * Extended version of `ActiveEffect` class with Everyday Heroes-specific features.
 */
export default class ActiveEffectEH extends ActiveEffect {

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Details for a condition effect.
	 * @type {{id: string, level: number}|null}
	 */
	get conditionDetails() {
		const type = foundry.utils.getProperty(this, "flags.everyday-heroes.type");
		if ( type !== "condition" ) return null;
		let id;
		if ( this.statuses.size === 1 ) id = this.statuses.first();
		return { id, level: foundry.utils.getProperty(this, "flags.everyday-heroes.level") };
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Methods                                  */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @inheritDoc */
	apply(document, change) {
		// Grab DataField instance for target, if not found, fallback on default Foundry implementation
		const keyPath = change.key.replace("system.", "");
		const field = document.system.schema.getField(keyPath);
		if ( !change.key.startsWith("system.") || !field ) return super.apply(document, change);

		// Get the current value of the target field
		const current = foundry.utils.getProperty(document, change.key) ?? null;

		// Convert input using field's _ehCastEffectValue if it exists
		let delta;
		try {
			try {
				delta = JSON.parse(change.value);
			} catch(err) {
				delta = change.value;
			}
			delta = field._ehCastDelta(delta);
		} catch(err) {
			console.warn(
				`Actor ${document.name} [${document.id}] | Unable to parse active effect change `
				+ `for %c${change.key}%c "${change.value}": %c${err.message}`,
				"color: blue", "", "color: crimson"
			);
			return;
		}

		const MODES = CONST.ACTIVE_EFFECT_MODES;
		const changes = {};
		switch ( change.mode ) {
			case MODES.ADD:
				field._ehApplyAdd(document, change, current, delta, changes);
				break;
			case MODES.MULTIPLY:
				field._ehApplyMultiply(document, change, current, delta, changes);
				break;
			case MODES.OVERRIDE:
				field._ehApplyOverride(document, change, current, delta, changes);
				break;
			case MODES.UPGRADE:
				field._ehApplyUpgrade(document, change, current, delta, changes);
				break;
			case MODES.DOWNGRADE:
				field._ehApplyDowngrade(document, change, current, delta, changes);
				break;
			default:
				this._applyCustom(document, change, current, delta, changes);
				break;
		}

		// Apply all changes to the Document data
		foundry.utils.mergeObject(document, changes);
		return changes;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  List Rendering                           */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare Active Effects for display on Actor or Item sheets.
	 * @param {ActiveEffectEH[]} effects - Effects to display on the sheet.
	 * @returns {object}
	 */
	static prepareActiveEffectSections(effects) {
		const sections = {
			temporary: {
				label: "EH.Effect.State.Temporary",
				effects: [],
				create: [
					{
						label: "EH.Effect.State.Temporary",
						dataset: {}
					}
				]
			},
			passive: {
				label: "EH.Effect.State.Passive",
				effects: [],
				create: [
					{
						label: "EH.Effect.State.Passive",
						dataset: {}
					}
				]
			},
			inactive: {
				label: "EH.Effect.State.Inactive",
				effects: [],
				create: [
					{
						label: "EH.Effect.State.Inactive",
						dataset: {}
					}
				]
			}
		};

		for ( const effect of effects ) {
			if ( effect.disabled ) sections.inactive.effects.push(effect);
			else if ( effect.isTemporary ) sections.temporary.effects.push(effect);
			else sections.passive.effects.push(effect);
		}

		return sections;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Event Listeners & Handlers               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Construct context menu options for this Advancement.
	 * @returns {ContextMenuEntry[]}
	 */
	getContextMenuOptions() {
		if ( this.parent.isOwner && !this.parent.collection?.locked ) return [
			{
				label: "EH.Effect.Action.Edit",
				icon: "<i class='fas fa-edit fa-fw'></i>",
				onClick: () => this.item.sheet._openDocumentSheet(this)
			},
			{
				label: "EH.Effect.Action.Duplicate",
				icon: "<i class='fas fa-copy fa-fw'></i>",
				onClick: () => this.clone({ name: game.i18n.format("DOCUMENT.CopyOf", { name: this.name }) }, { save: true })
			},
			{
				label: "EH.Effect.Action.Delete",
				icon: "<i class='fas fa-trash fa-fw' style='color: rgb(255, 65, 65);'></i>",
				onClick: () => this.deleteDialog()
			},
			{
				label: `EH.Effect.Action.${this.disabled ? "Enable" : "Disable"}`,
				icon: `<i class="fa-solid fa-${this.disabled ? "check" : "times"} fa-fw"></i>`,
				group: "state",
				onClick: () => this.update({ disabled: !this.disabled })
			}
		];

		return [{
			label: "EH.Effect.Action.View",
			icon: "<i class='fas fa-eye fa-fw'></i>",
			onClick: () => this.item.sheet._openDocumentSheet(this)
		}];
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle context menu events on advancement.
	 * @param {Actor5e|Item5e} doc - The Actor or Item the Active Effect belongs to.
	 * @param {HTMLElement} target - The element the menu was triggered on.
	 */
	static onContextMenu(doc, target) {
		const { effectId, parentId } = target.closest("[data-effect-id]")?.dataset ?? {};
		const effect = parentId ? doc.items.get(parentId)?.effects.get(effectId) : doc.effects.get(effectId);
		if ( !effect ) return;

		const menuItems = effect.getContextMenuOptions();

		/**
		 * A hook event that fires when the context menu for the active effect list is constructed.
		 * @function everydayHeroes.getActiveEffectContext
		 * @memberof hookEvents
		 * @param {ActiveEffect} effect - The Active Effect.
		 * @param {HTMLElement} target - The element that menu was triggered on.
		 * @param {ContextMenuEntry[]} menuItems - The context menu entries.
		 */
		Hooks.call("everydayHeroes.getActiveEffectContext", effect, target, menuItems);

		ui.context.menuItems = menuItems;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle a effect actions on an Actor or Item sheet.
	 * @this {EHActorSheet|EHItemSheet}
	 * @param {ClickEvent} event - Triggering click event.
	 * @returns {Promise}
	 */
	static async onEffectAction(event) {
		event.preventDefault();
		const { effectId, parentId } = event.currentTarget.closest("[data-effect-id]")?.dataset ?? {};
		const id = event.currentTarget.closest("[data-effect-id]")?.dataset.effectId;
		const effect = parentId
			? this.document.items.get(parentId)?.effects.get(effectId)
			: this.document.effects.get(effectId);
		const type = event.currentTarget.dataset.type ?? event.currentTarget.dataset.action;
		switch (type) {
			case "add":
			case "addDocument":
				return ActiveEffectEH._onAddEffect.call(this, event, event.currentTarget);
			case "edit":
			case "editDocument":
			case "showDocument":
				return effect.sheet.render({ force: true });
			case "delete":
			case "deleteDocument":
				return effect.deleteDialog();
			case "toggle":
			case "toggleEffect":
				return effect.update({ disabled: !effect.disabled });
			default:
				return console.warn(`Everyday Heroes | Invalid effect action type clicked ${type}.`);
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle adding a new effect.
	 * @this {EHActorSheet|EHItemSheet}
	 * @param {Event} event - Triggering click event.
	 * @param {HTMLElement} target - Button that was clicked.
	 */
	static _onAddEffect(event, target) {
		const section = target.closest("[data-section-id]")?.dataset.sectionId;
		return this.document.createEmbeddedDocuments("ActiveEffect", [{
			name: game.i18n.localize("EH.Effect.New"),
			img: this.document.constructor === ItemEH ? this.document.img : "icons/svg/aura.svg",
			origin: this.document.uuid,
			duration: {
				rounds: section === "temporary" ? 1 : undefined
			},
			disabled: section === "inactive"
		}]);
	}
}
