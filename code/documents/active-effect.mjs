/**
 * Extended version of `ActiveEffect` class with Everyday Heroes-specific features.
 */
export default class ActiveEffectEH extends ActiveEffect {

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
					icon: "icons/svg/aura.svg", // TODO: Replace with item icon
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
