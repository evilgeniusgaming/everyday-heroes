/**
 * Sheet that represents Armor, Weapon, Explosive, and Gear items.
 */
export default class PhysicalSheet extends ItemSheet {

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["everyday-heroes", "sheet", "physical", "item"],
			template: "systems/everyday-heroes/templates/item/physical-sheet.hbs",
			tabs: [{navSelector: 'nav[data-group="primary"]', contentSelector: "main", initial: "description"}],
			width: 570,
			height: 500
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Context Preparation                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async getData(options) {
		const context = await super.getData(options);

		context.CONFIG = CONFIG.EverydayHeroes;
		context.system = context.item.system;

		const applicableProperties = CONFIG.EverydayHeroes.applicableProperties[context.item.type];
		if ( applicableProperties ) {
			context.itemProperties = Object.entries(CONFIG.EverydayHeroes.equipmentProperties)
				.reduce((obj, [k, v]) => {
					if ( applicableProperties.includes(k) ) {
						obj[k] = foundry.utils.deepClone(v);
						obj[k].checked = context.item.system.properties.has(k);
					}
					return obj;
				}, {});
		}
		context.itemSubTypes = foundry.utils.getProperty(CONFIG.EverydayHeroes, `${context.item.type}Types`);

		// context.diceSteps = CONFIG.EverydayHeroes.diceSteps.reduce((obj, n) => {
		// 	obj[n] = `d${n}`;
		// 	return obj;
		// }, {});
		context.diceSteps = Object.fromEntries(CONFIG.EverydayHeroes.diceSteps.map(n => [n, `d${n}`]));

		const enrichmentContext = {
			secrets: this.item.isOwner, rollData: this.item.getRollData(), async: true, relativeTo: this.item
		};
		context.enriched = {
			description: await TextEditor.enrichHTML(context.system.description.value, enrichmentContext),
			chat: await TextEditor.enrichHTML(context.system.description.chat, enrichmentContext)
		};

		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Action Handlers                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_getSubmitData(updateData={}) {
		const formData = foundry.utils.expandObject(super._getSubmitData(updateData));

		// Handle Properties
		if ( this.item.system.hasOwnProperty("properties") ) {
			// TODO: No need to convert to array when Foundry V11 is required version
			formData.system.properties = Array.from(EverydayHeroes.utils.objectToSet(formData.system.properties));
		}

		// Return the flattened submission data
		return foundry.utils.flattenObject(formData);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Drag & Drop                              */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

}
