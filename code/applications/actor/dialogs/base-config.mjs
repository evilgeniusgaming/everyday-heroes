/**
 * Base configuration dialog for actor properties.
 */
export default class BaseConfig extends DocumentSheet {

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			submitOnChange: true,
			closeOnSubmit: false
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get title() {
		return `${game.i18n.format("EH.Configuration.Title", { type: this.type })}`;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Configuration type used when building the title.
	 * @type {string}
	 */
	get type() {
		return "";
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Context Preparation                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async getData(options) {
		return foundry.utils.mergeObject({
			CONFIG: CONFIG.EverydayHeroes,
			source: this.document.toObject().system,
			system: this.document.system
		}, await super.getData(options));
	}
}
