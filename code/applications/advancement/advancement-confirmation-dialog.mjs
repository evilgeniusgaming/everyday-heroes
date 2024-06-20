/**
 * Dialog to confirm the deletion of an embedded item with advancement or decreasing a class level.
 */
export default class AdvancementConfirmationDialog extends Dialog {

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["dialog", "everyday-heroes"],
			template: "systems/everyday-heroes/templates/advancement/advancement-confirmation-dialog.hbs",
			jQuery: false
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * A helper function that displays the dialog prompting for an item deletion.
	 * @param {ItemEH} item - Item to be deleted.
	 * @returns {Promise<boolean|null>} - Resolves with whether advancements should be unapplied. Rejects with null.
	 */
	static forDelete(item) {
		return this.createDialog(
			item,
			game.i18n.localize("EH.Advancement.Confirmation.Title.Delete"),
			game.i18n.localize("EH.Advancement.Confirmation.Message.Delete"),
			{
				icon: '<i class="fas fa-trash"></i>',
				label: game.i18n.localize("Delete")
			}
		);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * A helper function that displays the dialog prompting for leveling down.
	 * @param {ActorEH} actor - The actor being changed.
	 * @returns {Promise<boolean|null>} - Resolves with whether advancements should be unapplied. Rejects with null.
	 */
	static forLevelDown(actor) {
		return this.createDialog(
			actor,
			game.i18n.localize("EH.Advancement.Confirmation.Title.LevelDown"),
			game.i18n.localize("EH.Advancement.Confirmation.Message.LevelDown"),
			{
				icon: '<i class="fas fa-sort-numeric-down-alt"></i>',
				label: game.i18n.localize("EH.Level.Action.Decrease")
			}
		);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * A helper constructor function which displays the confirmation dialog.
	 * @param {ActorEH|ItemEH} document - Actor or Item to be changed.
	 * @param {string} title - Localized dialog title.
	 * @param {string} message - Localized dialog message.
	 * @param {object} continueButton - Object containing label and icon for the action button.
	 * @returns {Promise<boolean|null>}  Resolves with whether advancements should be unapplied. Rejects with null.
	 */
	static createDialog(document, title, message, continueButton) {
		return new Promise((resolve, reject) => {
			const dialog = new this({
				title: `${title}: ${document.name}`,
				content: message,
				buttons: {
					continue: foundry.utils.mergeObject(continueButton, {
						callback: html => {
							const checkbox = html.querySelector('input[name="apply-advancement"]');
							resolve(checkbox.checked);
						}
					}),
					cancel: {
						icon: '<i class="fas fa-times"></i>',
						label: game.i18n.localize("Cancel"),
						callback: html => reject(null)
					}
				},
				default: "continue",
				close: () => reject(null)
			});
			dialog.render(true);
		});
	}
}
