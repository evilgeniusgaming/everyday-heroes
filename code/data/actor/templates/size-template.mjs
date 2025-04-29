/**
 * Data model template for actors that have size.
 * @mixin
 *
 * @property {object} traits
 * @property {string} traits.size - Size of the Actor.
 */
export default class SizeTemplate extends foundry.abstract.DataModel {
	static defineSchema() {
		return {
			traits: new foundry.data.fields.SchemaField({
				size: new foundry.data.fields.StringField({
					initial: "medium", label: "EH.Size.Label", suggestions: CONFIG.EverydayHeroes.sizes
				})
			}, {label: "EH.Traits.Label"})
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareBaseSize() {
		Object.defineProperty(this.traits, "isTitanic", {
			get() {
				return CONFIG.EverydayHeroes.sizes[this.size]?.titanic ?? false;
			},
			set() {}, // TODO: Fix to "mergeObject" not properly handling properties like this
			configurable: true,
			enumerable: true
			// TODO: Maybe figure out a way to define this within the data model
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Socket Event Handlers                    */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async _preCreateSize(data, options, user) {
		if ( !foundry.utils.hasProperty(data, "prototypeToken.width")
			&& !foundry.utils.hasProperty(data, "prototypeToken.height")) {
			const size = CONFIG.EverydayHeroes.sizes[this.traits.size]?.token;
			this.parent.updateSource({ "prototypeToken.width": size, "prototypeToken.height": size });
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async _preUpdateScale(changed, options, user) {
		const newSize = foundry.utils.getProperty(changed, "system.traits.size");
		if ( !newSize || (newSize === this.traits.size) ) return;

		// Adjust movement if changed to/from titanic size
		const newIsTitanic = CONFIG.EverydayHeroes.sizes[newSize]?.titanic ?? false;
		if ( (newIsTitanic !== this.traits.isTitanic) && this.constructor.mixes("MovementTemplate") ) {
			if ( (newIsTitanic && (this.attributes.movement.units !== "space"))
		  	|| (!newIsTitanic && (this.attributes.movement.units === "space"))) {
				const adjustValue = keyPath => {
					const value = foundry.utils.getProperty(changed, keyPath) ?? foundry.utils.getProperty(this.parent, keyPath);
					foundry.utils.setProperty(changed, keyPath, Math.floor(value * (newIsTitanic ? 0.2 : 5)));
				};
				adjustValue("system.attributes.movement.value");
				Object.keys(this.attributes.movement.special).forEach(k => adjustValue(`system.attributes.movement.special.${k}`));
				foundry.utils.setProperty(changed, "system.attributes.movement.units", newIsTitanic ? "space" : "foot");

				// Update all embedded weapons & explosives
				const itemUpdates = [];
				for ( const item of this.parent.items ) {
					if ( foundry.utils.getType(item.system.titanicConversions) !== "function" ) continue;
					const updates = item.system.titanicConversions(newIsTitanic);
					if ( !foundry.utils.isEmpty(updates) ) {
						updates._id = item.id;
						itemUpdates.push(updates);
					}
				}
				if ( itemUpdates.length ) await this.parent.updateEmbeddedDocuments("Item", itemUpdates);
			}
		}

		// Adjust token size
		if ( !foundry.utils.hasProperty(changed, "prototypeToken.width")
			&& !foundry.utils.hasProperty(changed, "prototypeToken.height") ) {
			const size = CONFIG.EverydayHeroes.sizes[newSize]?.token;
			foundry.utils.setProperty(changed, "prototypeToken.width", size);
			foundry.utils.setProperty(changed, "prototypeToken.height", size);
		}
	}
}
