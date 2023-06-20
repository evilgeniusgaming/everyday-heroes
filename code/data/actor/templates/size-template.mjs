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
				size: new foundry.data.fields.StringField({initial: "medium", label: "EH.Size.Label"})
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
			configurable: false,
			enumerable: true
			// TODO: Maybe figure out a way to define this within the data model
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Socket Event Handlers                    */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async _preUpdate(changed, options, user) {
		const newSize = foundry.utils.getProperty(changed, "system.traits.size");
		if ( !newSize || (newSize === this.traits.size) ) return;

		// Adjust movement if changed to/from titanic size
		const newIsTitanic = CONFIG.EverydayHeroes.sizes[newSize]?.titanic ?? false;
		if ( (newIsTitanic !== this.traits.isTitanic) && this.constructor.mixes("MovementTemplate") ) {
			if ( (newIsTitanic && (this.attributes.movement.units !== "space"))
		  	|| (!newIsTitanic && (this.attributes.movement.units === "space"))) {
				const adjustValue = keyPath => {
					if ( foundry.utils.hasProperty(changed, keyPath) ) return;
					foundry.utils.setProperty(changed, keyPath,
						Math.floor(foundry.utils.getProperty(this.parent, keyPath) * (newIsTitanic ? 0.2 : 5))
					);
				};
				adjustValue("system.attributes.movement.value");
				Object.keys(this.attributes.movement.special).forEach(k => adjustValue(`system.attributes.movement.special.${k}`));
				foundry.utils.setProperty(changed, "system.attributes.movement.units", newIsTitanic ? "space" : "foot");
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
