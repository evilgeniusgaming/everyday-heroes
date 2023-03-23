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
	/*  Context Preparation                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async getData(options) {
		return foundry.utils.mergeObject({
			CONFIG: CONFIG.EverydayHeroes,
			src: this.document.toObject().system,
			system: this.document.system
		}, await super.getData(options));
	}
}
