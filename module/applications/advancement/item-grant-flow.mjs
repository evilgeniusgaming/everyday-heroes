import AdvancementFlow from "./advancement-flow.mjs";

/**
 * Inline application that presents the player with a list of items to be added.
 */
export default class ItemGrantFlow extends AdvancementFlow {

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			template: "systems/everyday-heroes/templates/advancement/item-grant-flow.hbs"
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Produce the rendering context for this flow.
	 * @returns {object}
	 */
	async getContext() {
		const config = this.advancement.configuration.pool;
		const added = this.retainedData?.items.map(i => foundry.utils.getProperty(i, "flags.dnd5e.sourceId"))
      ?? this.advancement.value.added;
		const checked = new Set(Object.values(added ?? {}));
		return {
			items: (await Promise.all(config.map(fromUuid))).reduce((arr, item) => {
				if ( !item ) return arr;
				item.checked = added ? checked.has(item.uuid) : true;
				arr.push(item);
				return arr;
			}, [])
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async getData(options={}) {
		return foundry.utils.mergeObject(super.getData(options), await this.getContext());
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	activateListeners(html) {
		super.activateListeners(html);
		html.find("a[data-uuid]").click(this._onClickFeature.bind(this));
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle clicking on a feature during item grant to preview the feature.
	 * @param {MouseEvent} event - The triggering event.
	 * @protected
	 */
	async _onClickFeature(event) {
		event.preventDefault();
		const uuid = event.currentTarget.dataset.uuid;
		const item = await fromUuid(uuid);
		item?.sheet.render(true);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async _updateObject(event, formData) {
		const retained = this.retainedData?.items.reduce((obj, i) => {
			obj[foundry.utils.getProperty(i, "flags.dnd5e.sourceId")] = i;
			return obj;
		}, {});
		await this.advancement.apply(this.level, { selected: formData, retained });
	}
}
