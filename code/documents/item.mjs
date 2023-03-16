import { buildRoll } from "../dice/utils.mjs";

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
	/*  Activation & Chat                        */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Configuration data for item activation.
	 *
	 * @typedef {object} ActivationConfiguration
	 * @property {boolean} configure - Should the configuration dialog be displayed?
	 * @property {object} consume
	 * @property {boolean} consume.resource - Should the item's linked resource be consumed?
	 * @property {boolean} consume.use - Should one of the item's uses be consumed?
	 */

	/**
	 * Updates that will be applied when an item is activated.
	 *
	 * @typedef {object} ActivationUpdates
	 * @property {object} actor - Updates applied to the actor.
	 * @property {object} item - Updates applied to the item being activated.
	 * @property {object[]} resource - Updates applied to other items on the actor.
	 */

	/**
	 * Activate this item, spending any uses and resource consumption.
	 * @param {ActivationConfiguration} [config] - Configuration information for the activation.
	 * @param {BaseMessageConfiguration} [message] - Configuration data that guides the message creation.
	 * @returns {Promise}
	 */
	async activate(config={}, message={}) {
		let item = this;

		const activationConfig = foundry.utils.mergeObject({
			consume: {
				resource: item.system.consumesResource ?? false,
				use: item.system.consumesUses ?? false
			}
		}, config);
		if ( activationConfig.configure === undefined ) {
			activationConfig.configure = Object.values(activationConfig.consume).some(v => v);
		}

		/**
		 * A hook event that fires before an item activation is configured.
		 * @function everydayHeroes.preActivateItem
		 * @memberof hookEvents
		 * @param {ItemEH} item - Item being activated.
		 * @param {ActivationConfiguration} config - Configuration data for the item activation being prepared.
		 * @param {BaseMessageConfiguration} message - Configuration data for the activation's message.
		 * @returns {boolean} - Explicitly return `false` to prevent item from being activated.
		 */
		if ( Hooks.call("everydayHeroes.preActivateItem", item, activationConfig, message) === false ) return;

		// TODO: Display configuration dialog
		if ( activationConfig.configure ) {
			console.log("Configuration Dialog!");
		}

		/**
		 * A hook event that fires before an item's resource consumption has been calculated.
		 * @function everydayHeroes.preItemActivationConsumption
		 * @memberof hookEvents
		 * @param {ItemEH} item - Item being activated.
		 * @param {ActivationConfiguration} config - Configuration data for the item activation being prepared.
		 * @param {BaseMessageConfiguration} message - Configuration data for the activation's message.
		 * @returns {boolean} - Explicitly return `false` to prevent item from being activated.
		 */
		if ( Hooks.call("everydayHeroes.preItemActivationConsumption", item, activationConfig, message) === false ) return;

		// Prepare usage & resource updates
		let updates;
		try {
			updates = item.prepareActivationUpdates(activationConfig);
		} catch(err) {
			ui.notifications.warn(err.message);
			// TODO: Display usage issues
			return;
		}

		/**
		 * A hook event that fires after an item's resource consumption has been calculated but before any
		 * changes have been made.
		 * @function everydayHeroes.itemActivationConsumption
		 * @memberof hookEvents
		 * @param {ItemEH} item - Item being activated.
		 * @param {ActivationConfiguration} config - Configuration data for the item activation being prepared.
		 * @param {BaseMessageConfiguration} message - Configuration data for the activation's message.
		 * @param {ActivationUpdates} updates - Updates to be applied when the item is activated.
		 * @returns {boolean} - Explicitly return `false` to prevent item from being activated.
		 */
		if ( Hooks.call("everydayHeroes.itemActivationConsumption", item,
			activationConfig, message, updates) === false ) return;

		// Apply usage & resource updates
		if ( !foundry.utils.isEmpty(updates.actor) ) await this.actor.update(updates.actor);
		if ( !foundry.utils.isEmpty(updates.item) ) await this.update(updates.item);
		if ( !foundry.utils.isEmpty(updates.resource) ) await this.actor.updateEmbeddedDocuments("Item", updates.resource);

		// Create the chat card
		// TODO: If a dice resource is consumed, roll that resource and add to chat message
		const messageData = await this.displayInChat(message, { chatDescription: true });

		/**
		 * A hook event that fires when an item is used, after the measured template has been created if one is needed.
		 * @function everydayHeroes.activateItem
		 * @memberof hookEvents
		 * @param {ItemEH} item - Item being activated.
		 * @param {ActivationConfiguration} config - Configuration data for the item activation.
		 * @param {ChatMessage|BaseMessageConfiguration} message - Created chat message or the content that would have
		 *                                                         been used to create it.
		 */
		Hooks.callAll("everydayHeroes.activateItem", item, activationConfig, messageData);

		return messageData;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare the updates that will be applied to the actor or to items when this item is activated.
	 * @param {ActivationConfiguration} config - Configuration data for the item activation being prepared.
	 * @returns {ActivationUpdates}
	 * @throws if not enough of a certain resource to activate this item.
	 */
	prepareActivationUpdates(config) {
		const updates = {
			actor: {},
			item: {},
			resource: {}
		};

		if ( config.consume.resource ) {
			const res = this.system.resource;
			// TODO: Support other resource types
			if ( res.type !== "resource" ) {
				// TODO: Localize
				throw new Error("Only resource types are supported at the moment");
			}
			const resource = this.actor?.system.resources?.[res.target];
			if ( !resource ) {
				// TODO: Localize
				throw new Error(`Resource "${res.target}" not found to consume.`);
			}
			if ( resource.available < res.amount ) {
				// TODO: Localize
				throw new Error(`Only ${resource.available} uses of ${resource.label} available, ${res.amount} needed.`);
			}
			updates.actor[`system.resources.${res.target}.spent`] = resource.spent + res.amount;
		}

		if ( config.consume.use ) {
			const uses = this.system.uses;
			// TODO: Localize
			if ( uses.available < 1 ) throw new Error("No limited uses remaining.");
			updates.item["system.uses.spent"] = uses.spent + 1;
		}

		return updates;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Fetch the data needed to render this item's chat message and expanded state.
	 * @param {object} [enrichmentContext={}] - Options passed to the `enrichHTML` method.
	 * @returns {object}
	 */
	async chatContext(enrichmentContext={}) {
		const context = {
			item: this,
			actor: this.actor,
			token: this.actor?.token,
			system: this.toObject(false).system
		};
		enrichmentContext = foundry.utils.mergeObject({
			secrets: this.isOwner, rollData: this.getRollData(), async: true, relativeTo: this
		}, enrichmentContext);
		context.enriched = {
			description: await TextEditor.enrichHTML(context.system.description.value, enrichmentContext),
			chat: await TextEditor.enrichHTML(context.system.description.chat, enrichmentContext)
		};
		context.tags = this.system.chatTags ?? [];
		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Display an item's full description in chat.
	 * @param {BaseMessageConfiguration} [message] - Configuration data that guides the message creation.
	 * @param {object} [context] - Additional context passed during message rendering.
	 * @returns {Promise<ChatMessage|BaseMessageConfiguration>} - Created chat message or the content that would have
	 *                                                            been used to create it.
	 */
	async displayInChat(message={}, context={}) {
		context = foundry.utils.mergeObject(await this.chatContext(), context);
		const messageConfig = foundry.utils.mergeObject({
			rollMode: game.settings.get("core", "rollMode"),
			data: {
				title: `${this.name}: ${this.actor.name}`,
				content: await renderTemplate("systems/everyday-heroes/templates/item/item-card.hbs", context),
				speaker: ChatMessage.getSpeaker({actor: this.actor})
			}
		}, message);
		if ( messageConfig.create === false ) return messageConfig;
		ChatMessage.applyRollMode(messageConfig.data, messageConfig.rollMode);
		return await ChatMessage.create(messageConfig.data);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Helpers                                  */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Description of this item that will appear on the details tab of NPC sheets.
	 * @returns {Promise<string>}
	 */
	async npcDescription() {
		return this.system.npcDescription?.() ?? await TextEditor.enrichHTML(this.system.description?.value ?? "", {
			secrets: this.isOwner, rollData: this.getRollData(), async: true, relativeTo: this
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Label that will appear on the details tab of NPC sheets.
	 * @returns {Promise<string>}
	 */
	async npcLabel() {
		return this.system.npcLabel?.() ?? `<a data-action="roll-item" data-type="activate">${this.name}</a>`;
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

		const { parts, data } = buildRoll({
			prof: this.system.proficiency.hasProficiency ? this.system.proficiency.term : null,
			bonus: this.system.bonuses.save,
			globalBonus: this.actor?.system.bonuses?.ability?.save
		}, this.getRollData());

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

		const { parts, data } = buildRoll({
			mod: ability?.mod,
			prof: this.system.proficiency.hasProficiency ? this.system.proficiency.term : null,
			weaponBonus: this.system.bonuses.attack,
			ammoBonus: ammunition?.system.bonuses.attack,
			globalBonus: this.actor.system.bonuses.attack.all
			// TODO: Handle weapon- & category-type global bonuses
		}, this.getRollData());

		const rollConfig = foundry.utils.mergeObject({ data }, config);
		rollConfig.parts = parts.concat(config.parts ?? []);
		// TODO: Take expanded critical hit thresholds into account

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

		const { parts, data } = buildRoll({
			mod: ability?.mod,
			weaponBonus: this.system.bonuses.damage,
			ammoBonus: ammunition?.system.bonuses.damage,
			globalBonus: this.actor?.system.bonuses?.damage?.all
			// Global attack-type specific damage bonus?
			// Global damage-type specific damage bonus?
		}, this.getRollData());

		// TODO: Add support for "Making a Mess" extra critical damage

		const rollConfig = foundry.utils.mergeObject({ data }, config);
		rollConfig.parts = [this.system.damage.dice].concat(parts).concat(config.parts ?? []);

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
		if ( this.actor.system.items?.[this.id] ) {
			this.actor.update({[`system.items.-=${this.id}`]: null});
		}
	}

	/* -------------------------------------------- */
	/*  Importing and Exporting                     */
	/* -------------------------------------------- */

	static async createDialog(data={}, {parent=null, pack=null, ...options}={}) {

		// Collect data
		const documentName = this.metadata.name;
		const types = foundry.utils.deepClone(game.documentTypes[documentName]);
		const folders = parent ? [] : game.folders.filter(f => (f.type === documentName) && f.displayed);
		const label = game.i18n.localize(this.metadata.label);
		const title = game.i18n.format("DOCUMENT.Create", {type: label});

		const categories = {};
		for ( const [key, value] of Object.entries(CONFIG.EverydayHeroes.itemCategories) ) {
			categories[key] = { label: value.label, children: {} };
			for ( const type of value.types ) {
				categories[key].children[type] = {
					label: game.i18n.localize(CONFIG[documentName]?.typeLabels?.[type] ?? type)
				};
			}
		}

		// Render the document creation form
		const html = await renderTemplate("systems/everyday-heroes/templates/item/dialogs/item-create.hbs", {
			folders,
			name: data.name || game.i18n.format("DOCUMENT.New", {type: label}),
			folder: data.folder,
			hasFolders: folders.length >= 1,
			type: data.type || CONFIG[documentName]?.defaultType || types[0],
			categories
		});

		// Render the confirmation dialog window
		return Dialog.prompt({
			title: title,
			content: html,
			label: title,
			callback: html => {
				const form = html[0].querySelector("form");
				const fd = new FormDataExtended(form);
				foundry.utils.mergeObject(data, fd.object, {inplace: true});
				if ( !data.folder ) delete data.folder;
				if ( types.length === 1 ) data.type = types[0];
				if ( !data.name?.trim() ) data.name = this.defaultName();
				return this.create(data, {parent, pack, renderSheet: true});
			},
			rejectClose: false,
			options
		});
	}
}
