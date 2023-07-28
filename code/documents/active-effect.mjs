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

	_applyAdd(actor, change, current, delta, changes) {
		if ( current instanceof Set ) {
			if ( Array.isArray(delta) ) delta.forEach(i => current.add(i));
			else current.add(delta);
			return;
		}
		super._applyAdd(actor, change, current, delta, changes);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_applyUpgrade(actor, change, current, delta, changes) {
		if ( current === null || current === undefined ) changes[change.key] = delta;
		else super._applyUpgrade(actor, change, current, delta, changes);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_applyOverride(actor, change, current, delta, changes) {
		if ( current instanceof Set ) {
			current.clear();
			if ( Array.isArray(delta) ) delta.forEach(item => current.add(item));
			else current.add(delta);
			return;
		}
		return super._applyOverride(actor, change, current, delta, changes);
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
					label: game.i18n.localize("EH.Effect.New"),
					icon: this.document.constructor === ItemEH ? this.document.img : "icons/svg/aura.svg",
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
