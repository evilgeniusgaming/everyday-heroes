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

	/**
	 * Handle a effect actions on an Actor or Item sheet.
	 * @param {ClickEvent} event - Triggering click event.
	 * @returns {Promise}
	 */
	static async onEffectAction(event) {
		event.preventDefault();
		const id = event.currentTarget.closest("[data-effect-id]")?.dataset.effectId;
		const section = event.currentTarget.closest("[data-section-id]")?.dataset.sectionId;
		const effect = id ? this.document.effects.get(id) : null;
		const { type } = event.currentTarget.dataset;
		switch (type) {
			case "add":
				return this.document.createEmbeddedDocuments("ActiveEffect", [{
					name: game.i18n.localize("EH.Effect.New"),
					img: this.document.constructor === ItemEH ? this.document.img : "icons/svg/aura.svg",
					origin: this.document.uuid,
					duration: {
						rounds: section === "temporary" ? 1 : undefined
					},
					disabled: section === "inactive"
				}]);
			case "edit":
				return effect.sheet.render(true);
			case "delete":
				return effect.deleteDialog();
			case "toggle":
				return effect.update({disabled: !effect.disabled});
			default:
				return console.warn(`Everyday Heroes | Invalid effect action type clicked ${type}.`);
		}
	}
}
