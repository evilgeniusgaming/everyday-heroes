/**
 * Extended version of `Item` class to support Everyday Heroes features.
 */
export default class ItemEH extends Item {

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareBaseData() {
		this.system.prepareBaseData?.();
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedData() {
		this.system.prepareDerivedData?.();
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Advancement                              */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Create a new advancement of the specified type.
	 * @param {string} type - Type of advancement to create.
	 * @param {object} [data] - Data to use when creating the advancement.
	 * @param {object} [options]
	 * @param {boolean} [options.showConfig=true] - Should the new advancement's configuration application be shown?
	 * @param {boolean} [options.source=false] - Should a source-only update be performed?
	 * @returns {Promise<AdvancementConfig>|ItemEH} - Promise for advancement config for new advancement if local
	 *                                                is `false`, or item with newly added advancement.
	 */
	createAdvancement(type, data={}, { showConfig=true, source=false }={}) {
		if ( !this.system.advancement ) return this;

		const Advancement = CONFIG.EverydayHeroes.advancementTypes[type];
		if ( !Advancement ) throw new Error(`${type} not found in CONFIG.EverydayHeroes.advancementTypes`);

		if ( !Advancement.metadata.validItemTypes.has(this.type) || !Advancement.availableForItem(this) ) {
			throw new Error(`${type} advancement cannot be added to ${this.name}`);
		}

		const advancement = new Advancement(data, {parent: this});
		const advancementCollection = this.system.advancement.toObject();
		advancementCollection.push(advancement.toObject());
		if ( source ) return this.updateSource({"system.advancement": advancementCollection});
		return this.update({"system.advancement": advancementCollection}).then(() => {
			if ( !showConfig ) return this;
			const config = new Advancement.metadata.apps.config(this.system.advancement.get(advancement.id));
			return config.render(true);
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Update an advancement belonging to this item.
	 * @param {string} id - ID of the advancement to update.
	 * @param {object} updates - Updates to apply to this advancement.
	 * @param {object} [options={}]
	 * @param {boolean} [options.source=false] - Should a source-only update be performed?
	 * @returns {Promise<ItemEH>|ItemEH} - This item with the changes applied, promised if source is `false`.
	 */
	updateAdvancement(id, updates, { source=false }={}) {
		if ( !this.system.advancement ) return this;
		const advancementCollection = this.system.advancement.toObject();
		const idx = advancementCollection.findIndex(a => a._id === id);
		if ( idx === -1 ) throw new Error(`Advancement of ID ${id} could not be found to update`);

		const advancement = this.system.advancement.get(id);
		advancement.updateSource(updates);
		if ( source ) {
			advancement.render();
			return this;
		}

		advancementCollection[idx] = advancement.toObject();
		return this.update({"system.advancement": advancementCollection}).then(r => {
			advancement.render();
			return r;
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Remove an advancement from this item.
	 * @param {string} id - ID of the advancement to remove.
	 * @param {object} [options={}]
	 * @param {boolean} [options.source=false] - Should a source-only update be performed?
	 * @returns {Promise<ItemEH>|ItemEH} - This item with the changes applied.
	 */
	deleteAdvancement(id, { source=false }={}) {
		if ( !this.system.advancement ) return this;
		const advancementCollection = this.system.advancement.toObject().filter(a => a._id !== id);
		if ( source ) return this.updateSource({"system.advancement": advancementCollection});
		return this.update({"system.advancement": advancementCollection});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Duplicate an advancement, resetting its value to default and giving it a new ID.
	 * @param {string} id - ID of the advancement to duplicate.
	 * @param {object} [options]
	 * @param {boolean} [options.showConfig=true] - Should the new advancement's configuration application be shown?
	 * @param {boolean} [options.source=false] - Should a source-only update be performed?
	 * @returns {Promise<AdvancementConfig>|ItemEH} - Promise for advancement config for duplicate advancement if source
	 *                                                is `false`, or item with newly duplicated advancement.
	 */
	duplicateAdvancement(id, options) {
		const original = this.system.advancement.get(id);
		if ( !original ) return this;
		const duplicate = original.toObject();
		delete duplicate._id;
		if ( original.constructor.metadata.dataModels?.value ) {
			duplicate.value = (new original.constructor.metadata.dataModels.value()).toObject();
		} else {
			duplicate.value = original.constructor.metadata.defaults?.value ?? {};
		}
		return this.createAdvancement(original.constructor.typeName, duplicate, options);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	getEmbeddedDocument(embeddedName, id, options) {
		if ( embeddedName !== "Advancement" ) return super.getEmbeddedDocument(embeddedName, id, options);
		const advancement = this.system.advancement.get(id);
		if ( options?.strict && (advancement === undefined) ) {
			throw new Error(`The key ${id} does not exist in the ${embeddedName} Collection`);
		}
		return advancement;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Rolls                                    */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async rollArmorSave(config={}, options={}) {
		
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async rollAttack(config={}, options={}) {
		
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async rollDamage(config={}, options={}) {
		
	}

}
