/**
 * Extended version of `Item` class to support Everyday Heroes features.
 */
export default class ItemEH extends Item {

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
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
		if ( !this.isEmbedded ) return null;
		return this.parent?.system.items?.[this.id]?.equipped ?? false;
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
	/*  Reloading                                */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Configuration information for a reload action.
	 *
	 * @typedef {object} ReloadConfiguration
	 * @property {ItemEH} [ammunition] - Ammunition to be loaded. Blank means the default weapon ammunition will be used.
	 * @property {number} [roundsToReload] - How many rounds should be added to the weapon.
	 */

	/**
	 * Reload a weapon.
	 * @param {ReloadConfiguration} [config] - Configuration information for the reload process.
	 * @param {BaseMessageConfiguration} [message] - Configuration data that guides roll message creation.
	 * @returns {Promise}
	 */
	async reload(config={}, message={}) {
		if ( !this.system.usesRounds ) return console.warn(`${this.name} cannot be reloaded.`);
		if ( !this.system.rounds.spent ) return;

		const ammunition = this.system.ammunition;
		const roundsToReload = this.system.rounds.spent;

		// TODO: If limited quantity of ammunition, limit rounds reloaded to remaining quantity
		// TODO: If no quantity left, display a warning

		const reloadConfig = foundry.utils.mergeObject({ ammunition, roundsToReload }, config);

		const flavor = game.i18n.localize("EH.Weapon.Action.Reload.Label");
		const content = game.i18n.format(
			`EH.Weapon.Action.Reload.Message${ammunition ? "Specific" : "Generic"}`,
			{ actor: this.actor.name, number: roundsToReload, ammo: ammunition?.name, weapon: this.name }
		);
		const messageConfig = foundry.utils.mergeObject({
			data: {
				title: `${flavor}: ${this.actor.name}`,
				flavor,
				content,
				speaker: ChatMessage.getSpeaker({actor: this.actor}),
				"flags.everyday-heroes.reload": {
					origin: this.uuid,
					ammunition: ammunition?.uuid,
					roundsReloaded: roundsToReload
				}
			}
		}, message);

		/**
		 * A hook event that fires before a weapon is reloaded.
		 * @function everydayHeroes.preReload
		 * @memberof hookEvents
		 * @param {ItemEH} item - Item that is being reloaded.
		 * @param {ReloadConfiguration} config - Configuration data for the reload action.
		 * @param {BaseMessageConfiguration} message - Configuration data for the reload's message.
		 * @returns {boolean} - Explicitly return `false` to prevent the reload from occurring.
		 */
		if ( Hooks.call("everydayHeroes.preReload", this, reloadConfig, messageConfig) === false ) return;

		// Update the item & ammunition if necessary
		await this.update({"system.rounds.spent": Math.clamped(
			0, this.system.rounds.spent - reloadConfig.roundsToReload, this.system.rounds.capacity
		)});
		if ( reloadConfig.ammunition ) {
			console.log("Adjust ammunition quantity as necessary");
		}

		// Display chat message
		if ( messageConfig.create !== false ) {
			ChatMessage.applyRollMode(messageConfig.data, game.settings.get("core", "rollMode"));
			await ChatMessage.create(messageConfig.data);
		}

		/**
		 * A hook event that fires after a weapon is reloaded.
		 * @function everydayHeroes.reload
		 * @memberof hookEvents
		 * @param {ItemEH} item - Item that has been reloaded.
		 * @param {ReloadConfiguration} config - Configuration data for the reload action.
		 */
		Hooks.callAll("everydayHeroes.reload", this, reloadConfig);

		// TODO: Should this return anything?
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Rolls                                    */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Roll an armor saving throw.
	 * @param {ChallengeRollConfiguration} [config] - Configuration information for the roll.
	 * @param {BaseMessageConfiguration} [message] - Configuration data that guides roll message creation.
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
					origin: this.uuid
				}
			}
		}, message);

		/**
		 * A hook event that fires before an armor save is rolled for an Item.
		 * @function everydayHeroes.preRollArmorSave
		 * @memberof hookEvents
		 * @param {ItemEH} item - Item for which the armor save is being rolled.
		 * @param {ChallengeRollConfiguration} config - Configuration data for the pending roll.
		 * @param {BaseMessageConfiguration} message - Configuration data for the roll's message.
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
	 * @param {BaseMessageConfiguration} [message] - Configuration data that guides roll message creation.
	 * @returns {Promise<ChallengeRoll|void>}
	 */
	async rollAttack(config={}, message={}) {
		if ( !this.hasAttack ) return console.warn(`${this.name} does not support attack rolls.`);
		const ability = this.actor?.system.abilities[this.system.damageAbility];
		const ammunition = undefined;

		// Verify that the weapon has enough rounds left to make the attack
		if ( this.system.roundsToSpend > this.system.rounds.available ) {
			return console.warn("Not enough rounds in weapon.");
			// TODO: Display this as a UI messages
		}

		// TODO: Thrown weapons with limited quantities should consume a quantity
		// But "returning" also needs to be taken into account (probably manually)

		const parts = [];
		const data = this.getRollData();

		// Ability modifier
		if ( ability ) {
			parts.push("@mod");
			data.mod = ability.mod;
		}

		// Proficiency
		if ( this.system.proficiency.hasProficiency ) {
			parts.push("@prof");
			data.prof = this.system.proficiency.term;
		}

		// Weapon-specific bonus
		if ( this.system.bonuses.attack ) {
			parts.push("@weaponBonus");
			data.weaponBonus = Roll.replaceFormulaData(this.system.bonuses.attack, data);
		}

		// Ammunition-specific bonus
		if ( ammunition?.system.bonuses.attack ) {
			parts.push("@ammoBonus");
			data.ammoBonus = Roll.replaceFormulaData(ammunition.system.bonuses.attack, data);
		}

		// Global attack bonus
		if ( this.actor?.system.bonuses.attack.all ) {
			parts.push("@globalBonus");
			data.globalBonus = Roll.replaceFormulaData(this.actor.sytem.bonuses.attack.all, data);
			// TODO: Handle weapon- & category-type global bonuses
		}

		const rollConfig = foundry.utils.mergeObject({ data }, config);
		rollConfig.parts = parts.concat(config.parts ?? []);
		// TODO: Handle custom critical thresholds

		const flavor = this.system.attackTooltip;
		const messageConfig = foundry.utils.mergeObject({
			data: {
				title: `${flavor}: ${this.name}`,
				flavor,
				speaker: ChatMessage.getSpeaker({actor: this}),
				"flags.everyday-heroes.roll": {
					type: "attack",
					mode: this.system.mode,
					origin: this.uuid,
					ammunition: ammunition?.uuid,
					penetrationValue: this.system.penetrationValue + (ammunition?.system.penetrationValue ?? 0)
				}
			}
		}, message);

		/**
		 * A hook event that fires before an attack is rolled for an Item.
		 * @function everydayHeroes.preRollAttack
		 * @memberof hookEvents
		 * @param {ItemEH} item - Item for which the ability check is being rolled.
		 * @param {ChallengeRollConfiguration} config - Configuration data for the pending roll.
		 * @param {BaseMessageConfiguration} message - Configuration data for the roll's message.
		 * @returns {boolean} - Explicitly return `false` to prevent attack from being rolled.
		 */
		if ( Hooks.call("everydayHeroes.preRollAttack", this, rollConfig, messageConfig) === false ) return;

		const roll = await CONFIG.Dice.ChallengeRoll.build(rollConfig, messageConfig);

		/**
		 * A hook event that fires after an attack has been rolled for an Item.
		 * @function everydayHeroes.rollAttack
		 * @memberof hookEvents
		 * @param {ItemEH} item - Actor for which the ability check has been rolled.
		 * @param {D20Roll} roll - The resulting roll.
		 */
		if ( roll ) Hooks.callAll("everydayHeroes.rollAttack", this, roll);

		// Consume rounds
		if ( this.system.roundsToSpend ) await this.update({
			"system.rounds.spent": this.system.rounds.spent += this.system.roundsToSpend
		});

		return roll;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Roll damage for this weapon or explosive.
	 * @param {DamageRollConfiguration} [config] - Configuration information for the roll.
	 * @param {BaseMessageConfiguration} [message] - Configuration data that guides roll message creation.
	 * @returns {Promise<DamageRoll|void>}
	 */
	async rollDamage(config={}, message={}) {
		if ( !this.hasDamage ) return console.warn(`${this.name} does not support damage rolls.`);
		const ability = this.actor?.system.abilities[this.system.damageAbility];
		const ammunition = undefined;
		let damage = this.system.damage;

		// Modify damage based on selected ammunition
		// if ( ammunition ) {
		// 	this.system.modifyDamage(damage, ammunition.system.damage);
		// }

		// Modify damage if this is a burst attack
		// if ( this.system.mode === "burst" ) {
		// 	damage = this.system.modifyDamage(damage, { number: 1 });
		// }

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
					mode: this.system.mode,
					origin: this.uuid,
					ammunition: ammunition?.uuid
				}
			}
		}, message);

		/**
		 * A hook event that fires before a damage is rolled for an Item.
		 * @function everydayHeroes.preRollDamage
		 * @memberof hookEvents
		 * @param {ItemEH} item - Item for which the roll is being performed.
		 * @param {DamageRollConfiguration} config - Configuration data for the pending roll.
		 * @param {BaseMessageConfiguration} message - Configuration data for the roll's message.
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

		// Clear actor/item relationship information
		if ( this.actor.system.items[this.id] ) {
			this.actor.update({[`system.items.-=${this.id}`]: null});
		}
	}
}
