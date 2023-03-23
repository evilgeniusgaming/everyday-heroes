/**
 * Dialog to select which new advancements should be added to an item.
 */
export default class AdvancementMigrationDialog extends Dialog {
	constructor(item, advancements, data, options) {
		super(data, options);
		this.item = item;
		this.advancements = advancements;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["everyday-heroes", "dialog", "advancement-migration"],
			template: "systems/everyday-heroes/templates/advancement/advancement-migration-dialog.hbs",
			jQuery: false,
			width: 500
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Static Constructor                       */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * A helper constructor function which displays the migration dialog.
	 * @param {ItemEH} item - Item to which the advancements are being added.
	 * @param {Advancement[]} advancements - New advancements that should be displayed in the prompt.
	 * @returns {Promise<Advancement[]|null>} - Resolves with the advancements that should be added, if any.
	 */
	static createDialog(item, advancements) {
		return new Promise((resolve, reject) => {
			const dialog = new this(item, advancements, {
				title: `${game.i18n.localize("EH.Advancement.Migration.Title")}: ${item.name}`,
				buttons: {
					continue: {
						icon: '<i class="fas fa-check"></i>',
						label: game.i18n.localize("EH.Advancement.Migration.Action.Confirm"),
						callback: html => resolve(advancements.filter(a => html.querySelector(`[name="${a.id}"]`)?.checked))
					},
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

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Context Preparation                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async getData(options={}) {
		const context = await super.getData(options);
		context.item = this.item;
		context.advancements = this.advancements.map(a => ({
			id: a.id, icon: a.icon, title: a.title,
			summary: a.levels.length === 1 ? a.summaryForLevel(a.levels[0]) : ""
		}));
		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Action Handlers                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	submit(button, event) {
		event.preventDefault();
		super.submit(button, event);
	}
}
