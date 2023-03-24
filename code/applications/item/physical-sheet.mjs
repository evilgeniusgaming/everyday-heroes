import BaseItemSheet from "./base-item-sheet.mjs";

/**
 * Sheet that represents Armor, Weapon, Explosive, and Gear items.
 */
export default class PhysicalSheet extends BaseItemSheet {

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["everyday-heroes", "sheet", "physical", "item"],
			template: "systems/everyday-heroes/templates/item/physical-sheet.hbs"
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Context Preparation                      */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async getData(options) {
		const context = await super.getData(options);

		const applicableProperties = CONFIG.EverydayHeroes.applicableProperties[context.item.type];
		if ( applicableProperties ) {
			const prop = context.source.properties;
			const isObj = context.propertyModification = foundry.utils.getType(prop) !== "Set";
			context.itemProperties = Object.entries(CONFIG.EverydayHeroes.equipmentProperties)
				.reduce((obj, [k, v]) => {
					if ( applicableProperties.includes(k) ) {
						obj[k] = foundry.utils.deepClone(v);
						if ( (!isObj && prop.has(k)) || (isObj && (prop[k] === 1)) ) obj[k].value = "add";
						else if ( isObj && (prop[k] === -1) ) obj[k].value = "remove";
						else obj[k].value = "";
					}
					return obj;
				}, {});
		}
		context.itemSubTypes = foundry.utils.getProperty(CONFIG.EverydayHeroes, `${context.item.type}Types`);

		context.diceSteps = Object.fromEntries(CONFIG.EverydayHeroes.diceSteps.map(n => [n, `d${n}`]));

		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Action Handlers                          */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	activateListeners(jQuery) {
		super.activateListeners(jQuery);
		const html = jQuery[0];

		for ( const element of html.querySelectorAll('.properties [type="checkbox"]') ) {
			element.addEventListener("click", this._onCycleProperty.bind(this));
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle clicking the property buttons to cycle between modes.
	 * @param {ClickEvent} event - The triggering click event.
	 * @returns {Promise}
	 */
	_onCycleProperty(event) {
		event.preventDefault();
		const properties = event.target.closest(".properties");
		const input = event.target.closest("fieldset").querySelector('[type="hidden"]');
		if ( properties.classList.contains("modification") ) {
			if ( input.value === "add" ) input.value = "remove";
			else if ( input.value === "remove" ) input.value = "";
			else input.value = "add";
		} else {
			input.value = input.value === "add" ? "" : "add";
		}
		return this._onSubmit(event);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_getSubmitData(updateData={}) {
		const formData = foundry.utils.expandObject(super._getSubmitData(updateData));

		// Handle Properties
		if ( this.item.system.hasOwnProperty("properties") ) {
			if ( foundry.utils.getType(this.item.system.properties) === "Set" ) {
				formData.system.properties = Object.entries(formData.system.properties).reduce((arr, [key, value]) => {
					if ( value === "add" ) arr.push(key);
					return arr;
				}, []);
			} else {
				formData.system.properties = Object.entries(formData.system.properties).reduce((obj, [key, value]) => {
					if ( value === "add" ) obj[key] = 1;
					else if ( value === "remove" ) obj[key] = -1;
					else obj[key] = 0;
					return obj;
				}, {});
			}
		}

		// Return the flattened submission data
		return foundry.utils.flattenObject(formData);
	}

}
