import AdvancementManager from "../applications/advancement/advancement-manager.mjs";

/**
 * Extended version of `Item` class to support Everyday Heroes features.
 */
export default class ItemEH extends Item {

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Getters                                  */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Can armor saving throws be performed by this item?
	 * @type {boolean}
	 */
	get hasArmorSave() {
		return this.system.hasArmorSave ?? false;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Can attack rolls be performed by this item?
	 * @type {boolean}
	 */
	get hasAttack() {
		return this.system.hasAttack ?? false;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Can damage rolls be performed by this item?
	 * @type {boolean}
	 */
	get hasDamage() {
		return this.system.hasDamage ?? false;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Is this item equipped on the parent actor? Always returns `null` for non-embedded items.
	 * @type {boolean|null}
	 */
	get isEquipped() {
		return this.parent?.system.items?.equipped?.has(this.id) ?? null;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Singular type label for this item (e.g. "Weapon", "Archetype").
	 * @type {string}
	 */
	get typeLabel() {
		return game.i18n.localize(CONFIG.Item.typeLabels[this.type]);
	}

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

	/**
	 * Roll an armor saving throw.
	 * @param {ChallengeRollConfiguration} [config] - Configuration information for the roll.
	 * @param {RollMessageConfiguration} [message] - Configuration data that guides roll message creation.
	 * @returns {Promise<ChallengeRoll|void>}
	 */
	async rollArmorSave(config={}, message={}) {
		if ( !this.hasArmorSave ) return console.warn(`${this.name} does not support armor saving throws.`);

		const parts = [];
		const data = this.getRollData();

		if ( this.system.proficiency.hasProficiency ) {
			parts.push("@prof");
			data.prof = this.system.proficiency;
		}

		// Armor's save bonus
		if ( this.system.bonuses.save ) {
			parts.push("@bonus");
			data.bonus = Roll.replaceFormulaData(this.system.bonuses.save, data);
		}

		// Global save bonus
		if ( this.actor?.system.bonuses.ability.save ) {
			parts.push("@globalBonus");
			data.globalBonus = Roll.replaceFormulaData(this.actor.system.bonuses.ability.save, data);
		}

		const rollConfig = foundry.utils.mergeObject({ data }, config);
		rollConfig.parts = parts.concat(config.parts ?? []);

		const flavor = game.i18n.localize("EH.Armor.Action.Save.Label");
		const messageConfig = foundry.utils.mergeObject({
			data: {
				title: `${flavor}: ${this.actor.name}`,
				flavor,
				speaker: ChatMessage.getSpeaker({actor: this.actor}),
				"flags.everyday-heroes.roll": {
					type: "armor-save",
					itemID: this.id
				}
			}
		}, message);

		/**
		 * A hook event that fires before an armor save is rolled for an Item.
		 * @function everydayHeroes.preRollArmorSave
		 * @memberof hookEvents
		 * @param {ItemEH} item - Item for which the armor save is being rolled.
		 * @param {ChallengeRollConfiguration} config - Configuration data for the pending roll.
		 * @param {RollMessageConfiguration} message - Configuration data for the roll's message.
		 * @returns {boolean} - Explicitly return `false` to prevent ability check from being rolled.
		 */
		if ( Hooks.call("everydayHeroes.preRollAbilityCheck", this, rollConfig, messageConfig) === false ) return;

		const roll = await CONFIG.Dice.ChallengeRoll.build(rollConfig, messageConfig);

		/**
		 * A hook event that fires after an armor save has been rolled for an Item.
		 * @function everydayHeroes.rollArmorSave
		 * @memberof hookEvents
		 * @param {ItemEH} item - Item for which the armor save has been rolled.
		 * @param {D20Roll} roll - The resulting roll.
		 */
		if ( roll ) Hooks.callAll("everydayHeroes.rollAbilityCheck", this, roll);

		return roll;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Roll an attack for this weapon.
	 * @param {ChallengeRollConfiguration} [config] - Configuration information for the roll.
	 * @param {RollMessageConfiguration} [message] - Configuration data that guides roll message creation.
	 * @returns {Promise<ChallengeRoll|void>}
	 */
	async rollAttack(config={}, message={}) {
		if ( !this.hasAttack ) return console.warn(`${this.name} does not support attack rolls.`);

		// Verify that the weapon has enough ammunition for this attack type
		// Verify the provided attack type can be performed by this weapon
		// Fetch the correct ability to use with this attack
		// Build the attack w/ bonuses
		console.log("rollAttack", config, message);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Roll damage for this weapon or explosive.
	 * @param {DamageRollConfiguration} [config] - Configuration information for the roll.
	 * @param {RollMessageConfiguration} [message] - Configuration data that guides roll message creation.
	 * @returns {Promise<DamageRoll|void>}
	 */
	async rollDamage(config={}, message={}) {
		if ( !this.hasDamage ) return console.warn(`${this.name} does not support damage rolls.`);
		const ability = this.actor?.system.abilities[this.system.damageAbility()]; // TODO: Add attack type
		const ammunition = undefined;
		let damage = this.system.damage;

		// Modify damage based on selected ammunition
		if ( ammunition ) {
			damage = this.system.modifyDamage(damage, ammunition.system.damage);
		}

		// Modify damage if this is a burst attack

		const parts = [damage.dice];
		const data = this.getRollData();

		// Add ability modifier
		if ( ability ) {
			parts.push("@mod");
			data.mod = ability.mod;
		}

		// Weapon damage bonuses
		if ( this.system.bonuses.damage ) {
			parts.push("@weaponBonus");
			data.weaponBonus = Roll.replaceFormulaData(this.system.bonuses.damage, data);
		}

		// Ammunition damage bonuses
		if ( ammunition?.system.bonuses.damage ) {
			parts.push("@ammoBonus");
			data.ammoBonus = Roll.replaceFormulaData(ammunition.system.bonuses.damage, data);
		}

		// Global generic damage bonus
		if ( this.actor?.system.bonuses.damage.all ) {
			parts.push("@globalBonus");
			data.globalBonus = Roll.replaceFormulaData(this.actor.system.bonuses.damage.all, data);
		}
		// Global attack-type specific damage bonus?
		// Global damage-type specific damage bonus?

		// TODO: Add support for "Making a Mess" extra critical damage

		const rollConfig = foundry.utils.mergeObject({ data }, config);
		rollConfig.parts = parts.concat(config.parts ?? []);

		const flavor = game.i18n.localize("EH.Weapon.Action.DamageGeneric.Label");
		const messageConfig = foundry.utils.mergeObject({
			data: {
				title: `${flavor}: ${this.actor?.name ?? ""}`,
				flavor,
				speaker: ChatMessage.getSpeaker({actor: this.actor}),
				"flags.everyday-heroes.roll": {
					type: "damage",
					itemID: this.id
				},
				"flags.everyday-heroes.attack": {
					type: "" // Melee, ranged, burst, offhand, etc.
				}
			}
		}, message);

		/**
		 * A hook event that fires before a damage is rolled for an Item.
		 * @function everydayHeroes.preRollDamage
		 * @memberof hookEvents
		 * @param {ItemEH} item - Item for which the roll is being performed.
		 * @param {DamageRollConfiguration} config - Configuration data for the pending roll.
		 * @param {RollMessageConfiguration} message - Configuration data for the roll's message.
		 * @returns {boolean} - Explicitly return false to prevent the roll from being performed.
		 */
		if ( Hooks.call("everydayHeroes.preRollDamage", this, rollConfig, messageConfig) === false ) return;

		const roll = await CONFIG.Dice.DamageRoll.build(rollConfig, messageConfig);

		/**
		 * A hook event that fires after a damage has been rolled for an Item.
		 * @function everydayHeroes.rollDamage
		 * @memberof hookEvents
		 * @param {ItemEH} item - Item for which the roll was performed.
		 * @param {DamageRoll} roll - The resulting roll.
		 */
		if ( roll ) Hooks.callAll("everydayHeroes.rollDamage", this, roll);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Socket Event Handlers                    */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_onDelete(options, userId) {
		super._onDelete(options, userId);
		if ( (userId !== game.user.id) || !this.parent ) return;

		// Clear item's ID from equipped parent's lists
		const updates = {};
		for ( const [key, collection] of Object.entries(this.parent.system.items ?? {}) ) {
			const removed = collection.delete(this.id);
			// TODO: Coercing this to array won't be necessary in V11
			if ( removed ) updates[`system.items.${key}`] = Array.from(collection);
		}
		if ( !foundry.utils.isEmpty(updates) ) this.parent.udpate(updates);
	}
}
