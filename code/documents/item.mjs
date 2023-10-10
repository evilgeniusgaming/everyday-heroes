import SuppressiveFireTemplate from "../canvas/suppressive-fire-template.mjs";
import { buildMinimum, buildRoll } from "../dice/utils.mjs";
import { numberFormat, slugify, systemLog } from "../utils.mjs";
import { DocumentMixin } from "./mixin.mjs";

/**
 * Extended version of `Item` class to support Everyday Heroes features.
 */
export default class ItemEH extends DocumentMixin(Item) {

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

	get identifier() {
		if ( this.system.identifier?.value ) return this.system.identifier.value;
		return slugify(this.name, {strict: true});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Is this item equipped on the parent actor? Always returns `null` for non-embedded items.
	 * @type {boolean|null}
	 */
	get isEquipped() {
		if ( !this.isEmbedded ) return null;
		return this.system.equipped ?? this.parent.system.items?.[this.id]?.equipped ?? (this.parent.type === "npc");
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

		const config = CONFIG.EverydayHeroes.advancementTypes[type];
		const Advancement = config?.type;
		if ( !Advancement ) throw new Error(`${type} not found in CONFIG.EverydayHeroes.advancementTypes`);

		if ( !config.validItemTypes.has(this.type) || !Advancement.availableForItem(this) ) {
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
	 * @property {boolean} consume.cinematicAction - Should this item consume an actor's cinematic action?
	 * @property {boolean} consume.recharge - Should the item's charge be spent?
	 * @property {boolean} consume.resource - Should the item's linked resource be consumed?
	 * @property {boolean} consume.use - Should one of the item's uses be consumed?
	 * @property {boolean} deferConsumption - Should consumption updates be returned rather than acted upon?
	 *                                        This will also prevent message creation.
	 * @property {object} roll
	 * @property {boolean} roll.resource - Should a dice resource be automatically rolled if it is consumed?
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
				cinematicAction: item.system.shouldConsumeCinematicAction ?? false,
				recharge: item.system.consumesRecharge ?? false,
				resource: item.system.shouldConsumeResource ?? false,
				use: item.system.shouldConsumeUse ?? false
			},
			deferConsumption: false,
			roll: {
				resource: item.system.resource?.type === "resource"
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

		// If a dice resource is consumed, roll that resource and add to chat message
		if ( activationConfig.roll.resource && activationConfig.consume.resource ) {
			const roll = await this.actor.rollResource({
				resource: item.system.resource.target,
				consumed: 0,
				diceNumber: item.system.resource.dice,
				parts: item.system.resource.bonus ? [item.system.resource.bonus] : undefined
			}, { create: false });
			if ( roll ) {
				message.data ??= {};
				message.data.rolls = [roll].concat(message.data.rolls ?? []);
			}
		}

		// End early if defer consumption is true
		if ( activationConfig.deferConsumption ) return updates;

		// Apply usage & resource updates
		if ( !foundry.utils.isEmpty(updates.actor) ) await this.actor.update(updates.actor);
		if ( !foundry.utils.isEmpty(updates.item) ) await this.update(updates.item);
		if ( !foundry.utils.isEmpty(updates.resource) ) await this.actor.updateEmbeddedDocuments("Item", updates.resource);

		// Create the chat card
		const messageData = await this.displayInChat(message, { chatDescription: true });

		/**
		 * A hook event that fires when an item is used.
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
			resource: []
		};

		if ( config.consume.cinematicAction ) {
			const amount = this.system.activation.amount ?? 1;
			const cinematicActions = this.actor?.system.details?.cinematicActions;
			if ( !cinematicActions?.max ) throw new Error(game.i18n.localize("EH.CinematicAction.Warning.NotFound"));
			if ( amount > cinematicActions.available ) {
				const type = cinematicActions.available ? "Some" : "None";
				throw new Error(game.i18n.format(`EH.CinematicAction.Warning.Insufficient${type}`, {
					available: numberFormat(cinematicActions.available), required: numberFormat(amount)
				}));
			}
			updates.actor["system.details.cinematicActions.spent"] = cinematicActions.spent + amount;
		}

		if ( config.consume.recharge ) {
			const recharge = this.system.recharge;
			if ( !recharge.charged ) throw new Error(game.i18n.localize("EH.Recharge.Warning.NotCharged"));
			updates.item["system.recharge.charged"] = false;
		}

		if ( config.consume.use ) {
			const uses = this.system.uses;
			if ( uses.available < 1 ) throw new Error(game.i18n.localize("EH.Uses.Warning.Insufficient"));
			updates.item["system.uses.spent"] = uses.spent + 1;
		}

		if ( config.consume.resource ) {
			const res = this.system.resource;
			switch (res.type) {
				case "resource":
					const resource = this.actor?.system.resources?.[res.target];
					if ( !resource ) throw new Error(game.i18n.format("EH.Consumption.Warning.NotFound", { target: res.target }));
					if ( resource.available < res.amount ) {
						const type = resource.available ? "Some" : "None";
						throw new Error(game.i18n.format(`EH.Consumption.Warning.Insufficient${type}`, {
							available: resource.available, resource: resource.label, required: res.amount
						}));
					}
					updates.actor[`system.resources.${res.target}.spent`] = resource.spent + res.amount;
					break;
				case "hitDice":
					const hd = this.actor?.system.attributes?.hd ?? {};
					const newSpent = (hd.spent ?? 0) + res.amount;
					if ( newSpent > hd.max ) {
						const type = hd.available ? "Some" : "None";
						throw new Error(game.i18n.format(`EH.Consumption.Warning.Insufficient${type}`, {
							available: hd.available, resource: game.i18n.localize("EH.HitDice.Label[other]"), required: res.amount
						}));
					}
					updates.actor["system.attributes.hd.spent"] = Math.clamped(newSpent, 0, hd.max);
					break;
				case "uses":
					const otherItem = this.actor.items.get(res.target);
					if ( !otherItem ) throw new Error(game.i18n.format("EH.Consumption.Warning.NotFound", { target: res.target }));
					const uses = otherItem.system.uses;
					if ( uses.available < res.amount ) {
						const type = uses.available ? "Some" : "None";
						throw new Error(game.i18n.format(`EH.Consumption.Warning.Insufficient${type}`, {
							available: uses.available, resource: otherItem.name, required: res.amount
						}));
					}
					updates.resource.push({ _id: otherItem.id, "system.uses.spent": uses.spent + res.amount });
					break;
				default:
					throw new Error(game.i18n.format("EH.Consumption.Warning.InvalidType", { type: res.type }));
			}
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
		context.rollHTML = "";
		for ( const roll of message.data?.rolls ?? [] ) context.rollHTML += await roll.render();
		const messageConfig = foundry.utils.mergeObject({
			rollMode: game.settings.get("core", "rollMode"),
			data: {
				title: `${this.name}: ${this.actor.name}`,
				content: await renderTemplate("systems/everyday-heroes/templates/chat/item-card.hbs", context),
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

	getRollData({ deterministic=false }={}) {
		if ( foundry.utils.getType(this.system.getRollData) === "function" ) {
			return this.system.getRollData({ deterministic });
		}
		const rollData = {
			...(this.actor?.getRollData({ deterministic }) ?? {}),
			item: { ...this.system }
		};
		rollData.prof ??= this.system.proficiency;
		return rollData;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Description of this item that will appear on the details tab of NPC sheets.
	 * @returns {Promise<string>}
	 */
	async npcDescription() {
		return this.system.npcDescription?.() ?? "";
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Label that will appear on the details tab of NPC sheets.
	 * @returns {Promise<string>}
	 */
	async npcLabel() {
		return this.system.npcLabel?.() ?? "";
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Reloading                                */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Clear a jammed weapon.
	 * @param {object} [config] - Configuration information for the process.
	 * @param {BaseMessageConfiguration} [message] - Configuration data that guides message creation.
	 * @returns {Promise}
	 */
	async clearJam(config={}, message={}) {
		if ( !this.system.jammed ) return;

		const actor = this.system.user !== undefined ? this.system.user : this.actor;
		const clearJamConfig = foundry.utils.mergeObject({}, config);

		const content = game.i18n.format("EH.Weapon.Action.ClearJam.Message", { actor: actor.name, weapon: this.name });
		const messageConfig = foundry.utils.mergeObject({
			data: {
				title: `${game.i18n.localize("EH.Weapon.Action.ClearJam.Label")}: ${actor.name}`,
				content,
				speaker: ChatMessage.getSpeaker({ actor }),
				"flags.everyday-heroes.clearJam": {
					origin: this.uuid
				}
			}
		}, message);

		/**
		 * A hook event that fires before a weapon's jam is cleared..
		 * @function everydayHeroes.preClearJam
		 * @memberof hookEvents
		 * @param {ItemEH} item - Weapon that's jam is being cleared.
		 * @param {object} config - Configuration data for the action.
		 * @param {BaseMessageConfiguration} message - Configuration data for the clear jam message.
		 * @returns {boolean} - Explicitly return `false` to prevent the jam clearing from occurring.
		 */
		if ( Hooks.call("everydayHeroes.preClearJam", this, clearJamConfig, messageConfig) === false ) return;

		// Update the item & ammunition if necessary
		await this.update({"system.jammed": false});

		// Display chat message
		if ( messageConfig.create !== false ) {
			ChatMessage.applyRollMode(messageConfig.data, game.settings.get("core", "rollMode"));
			await ChatMessage.create(messageConfig.data);
		}

		/**
		 * A hook event that fires after a weapon jam is cleared.
		 * @function everydayHeroes.clearJam
		 * @memberof hookEvents
		 * @param {ItemEH} item -  Weapon that's jam has been cleared.
		 * @param {object} config - Configuration data for the action.
		 */
		Hooks.callAll("everydayHeroes.clearJam", this, clearJamConfig);
	}

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
	 * @param {BaseMessageConfiguration} [message] - Configuration data that guides message creation.
	 * @returns {Promise}
	 */
	async reload(config={}, message={}) {
		if ( !this.system.usesRounds ) return console.warn(`${this.name} cannot be reloaded.`);
		if ( !this.system.rounds.spent ) return;
		if ( this.system.jammed ) return ui.notifications.warn(game.i18n.localize("EH.Weapon.Action.Reload.Warning.Jammed"));

		const actor = this.system.user !== undefined ? this.system.user : this.actor;
		const ammunition = this.system.ammunition;
		const roundsToReload = this.system.rounds.spent;

		// TODO: If limited quantity of ammunition, limit rounds reloaded to remaining quantity
		// TODO: If no quantity left, display a warning

		const reloadConfig = foundry.utils.mergeObject({ ammunition, roundsToReload }, config);

		const content = game.i18n.format(
			`EH.Weapon.Action.Reload.Message${ammunition ? "Specific" : "Generic"}`,
			{ actor: actor.name, number: roundsToReload, ammo: ammunition?.name, weapon: this.name }
		);
		const messageConfig = foundry.utils.mergeObject({
			data: {
				title: `${game.i18n.localize("EH.Weapon.Action.Reload.Label")}: ${actor.name}`,
				content,
				speaker: ChatMessage.getSpeaker({ actor }),
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
			this.system.rounds.spent - reloadConfig.roundsToReload, 0, this.system.rounds.capacity
		)});
		// if ( reloadConfig.ammunition ) {
		// 	console.log("Adjust ammunition quantity as necessary");
		// }

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

	/**
	 * Use the suppressive fire action with this weapon.
	 * @param {SuppressiveFireConfiguration} [config] - Configuration information for the action.
	 * @param {BaseMessageConfiguration} [message] - Configuration data that guides message creation.
	 * @returns {Promise}
	 */
	async suppressiveFire(config={}, message={}) {
		const fireConfig = CONFIG.EverydayHeroes.weaponSuppressiveFire[
			this.system.properties.has("fullAuto") ? "fullAuto"
				: this.system.properties.has("semiAuto") ? "semiAuto" : null
		];
		if ( !fireConfig ) return console.log("Only semi-auto or full-auto weapons can perform suppressive fire.");
		const actor = this.system.user !== undefined ? this.system.user : this.actor;

		const suppressiveFireConfig = foundry.utils.mergeObject({
			rounds: this.system.roundsToSpend,
			size: fireConfig.size
		}, config);

		// Verify that the weapon isn't jammed & has enough rounds left to make the attack
		if ( this.system.jammed ) {
			return ui.notifications.warn(game.i18n.localize("EH.Weapon.Action.Attack.Warning.Jammed"));
		}
		if ( suppressiveFireConfig.rounds > this.system.rounds?.available ) {
			return ui.notifications.warn(game.i18n.localize("EH.Weapon.Action.Attack.Warning.Empty"));
		}

		const content = game.i18n.format(
			"EH.Weapon.Action.SuppressiveFire.Message", { actor: actor.name, weapon: this.name }
		);
		const messageConfig = foundry.utils.mergeObject({
			data: {
				title: `${game.i18n.localize("EH.Weapon.Mode.SuppressiveFire.Label")}: ${actor.name}`,
				content,
				speaker: ChatMessage.getSpeaker({ actor }),
				"flags.everyday-heroes.suppressiveFire": {
					origin: this.uuid,
					ammunition: this.ammunition?.uuid,
					maxWidth: suppressiveFireConfig.size,
					maxRange: this.system.range.long || this.system.range.short
				}
			}
		}, message);

		/**
		 * A hook event that fires before suppressive fire is used for an Item.
		 * @function everydayHeroes.preSuppressiveFire
		 * @memberof hookEvents
		 * @param {ItemEH} item - Weapon that will perform the suppressive fire.
		 * @param {SuppressiveFireConfiguration} suppressiveFireConfig - Configuration data for the fire.
		 * @param {BaseMessageConfiguration} message - Configuration data for the message.
		 * @returns {boolean} - Explicitly return `false` to prevent suppressive fire from being used.
		 */
		if ( Hooks.call("everydayHeroes.preSuppressiveFire", this, suppressiveFireConfig, messageConfig) === false ) return;

		const updates = {
			"system.rounds.spent": this.system.rounds.spent += suppressiveFireConfig.rounds
		};

		let template;
		let tokens = this.actor?.getActiveTokens() ?? [];
		if ( tokens.length > 1 ) tokens = tokens.filter(t => canvas.tokens.controlled.includes(t));
		if ( tokens.length === 1 ) {
			try {
				template = await SuppressiveFireTemplate.create(tokens[0].document, {
					maxWidth: suppressiveFireConfig.size,
					maxRange: this.system.range.long || this.system.range.short,
					templateData: {
						"flags.everyday-heroes": {
							weapon: this.uuid
						}
					}
				}).place(this.actor?.sheet);
				template = template[0];
			} catch(err) {
				if ( !(err instanceof SuppressiveFireTemplate.PlacementCanceledError) ) throw err;
			}
		}

		// Display chat message
		if ( messageConfig.create !== false ) {
			ChatMessage.applyRollMode(messageConfig.data, game.settings.get("core", "rollMode"));
			await ChatMessage.create(messageConfig.data);
		}

		/**
		 * A hook event that fires after suppressive fire has been activated for an Item.
		 * @function everydayHeroes.suppressiveFire
		 * @memberof hookEvents
		 * @param {ItemEH} item - Weapon that performed the suppressive fire.
		 * @param {object} updates - Changes to the weapon after the firing.
		 * @param {MeasuredTemplate} [template] - Added template, if any.
		 */
		Hooks.callAll("everydayHeroes.suppressiveFire", this, updates, template);

		if ( !foundry.utils.isEmpty(updates) ) await this.update(updates);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Rolls                                    */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle a roll event and pass it on to the indicated rolling method.
	 * @param {string} type - Type of roll to perform.
	 * @param {object} [config] - Additional configuration options.
	 * @param {object} [message] - Configuration data that guides roll message creation.
	 * @param {object} [dialog] - Presentation data for the roll configuration dialog.
	 * @returns {Promise}
	 */
	async roll(type, config={}, message={}, dialog={}) {
		let method;
		switch (type) {
			case "activate":
				method = "activate";
				break;
			case "armor-save":
				method = "rollArmorSave";
				break;
			case "attack":
				method = "rollAttack";
				break;
			case "damage":
				method = "rollDamage";
				break;
			case "recharge":
				method = "rollRecharge";
				break;
			default:
				if ( foundry.utils.getType(this.system.roll) === "function" ) {
					return this.system.roll(type, config, message, dialog);
				} else {
					return systemLog(`Invalid roll type clicked ${type}.`);
				}
		}
		if ( foundry.utils.getType(this.system[method]) === "function" ) {
			return this.system[method](config, message, dialog);
		} else {
			return this[method](config, message, dialog);
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Roll an armor saving throw.
	 * @param {ChallengeRollConfiguration} [config] - Configuration information for the roll.
	 * @param {BaseMessageConfiguration} [message] - Configuration data that guides roll message creation.
	 * @param {BaseDialogConfiguration} [dialog] - Presentation data for the roll configuration dialog.
	 * @returns {Promise<ChallengeRoll[]|void>}
	 */
	async rollArmorSave(config={}, message={}, dialog={}) {
		if ( !this.hasArmorSave ) return console.warn(`${this.name} does not support armor saving throws.`);
		const actor = this.system.user !== undefined ? this.system.user : this.actor;

		const { parts, data } = buildRoll({
			prof: this.system.proficiency.hasProficiency ? this.system.proficiency.term : null,
			bonus: this.system.bonuses.save,
			globalBonus: actor?.system.bonuses?.ability?.save
		}, this.getRollData());

		const rollConfig = foundry.utils.mergeObject({
			data,
			options: {
				minimum: buildMinimum([actor?.system.overrides?.ability?.minimums.save], data)
			}
		}, config);
		rollConfig.parts = parts.concat(config.parts ?? []);

		const flavor = game.i18n.format("EH.Action.Roll", { type: game.i18n.localize("EH.Armor.Action.Save.Label") });
		const messageConfig = foundry.utils.mergeObject({
			data: {
				title: `${flavor}: ${actor.name}`,
				flavor,
				speaker: ChatMessage.getSpeaker({ actor }),
				"flags.everyday-heroes.roll": {
					type: "armor-save",
					origin: this.uuid
				}
			}
		}, message);

		const dialogConfig = foundry.utils.mergeObject({
			options: {
				title: game.i18n.format("EH.Roll.Configuration.LabelSpecific", {
					type: game.i18n.format("EH.Armor.Action.Save.Label")
				})
			}
		}, dialog);

		/**
		 * A hook event that fires before an armor save is rolled for an Item.
		 * @function everydayHeroes.preRollArmorSave
		 * @memberof hookEvents
		 * @param {ItemEH} item - Item for which the armor save is being rolled.
		 * @param {ChallengeRollConfiguration} config - Configuration data for the pending roll.
		 * @param {BaseMessageConfiguration} message - Configuration data for the roll's message.
		 * @param {BaseDialogConfiguration} dialog - Presentation data for the roll configuration dialog.
		 * @returns {boolean} - Explicitly return `false` to prevent ability check from being rolled.
		 */
		if ( Hooks.call("everydayHeroes.preRollAbilityCheck", this, rollConfig, messageConfig,
			dialogConfig) === false ) return;

		const rolls = await CONFIG.Dice.ChallengeRoll.build(rollConfig, messageConfig, dialogConfig);

		/**
		 * A hook event that fires after an armor save has been rolled for an Item.
		 * @function everydayHeroes.rollArmorSave
		 * @memberof hookEvents
		 * @param {ItemEH} item - Item for which the armor save has been rolled.
		 * @param {ChallengeRoll[]} rolls - The resulting rolls.
		 */
		if ( !rolls?.length ) Hooks.callAll("everydayHeroes.rollAbilityCheck", this, rolls);

		return rolls;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Roll an attack for this weapon.
	 * @param {ChallengeRollConfiguration} [config] - Configuration information for the roll.
	 * @param {BaseMessageConfiguration} [message] - Configuration data that guides roll message creation.
	 * @param {BaseDialogConfiguration} [dialog] - Presentation data for the roll configuration dialog.
	 * @returns {Promise<ChallengeRoll[]|void>}
	 */
	async rollAttack(config={}, message={}, dialog={}) {
		if ( !this.hasAttack ) return console.warn(`${this.name} does not support attack rolls.`);
		const actor = this.system.user !== undefined ? this.system.user : this.actor;
		const ability = actor?.system.abilities[this.system.attackAbility];
		const ammunition = this.system.ammunition;

		// Verify that the weapon isn't jammed & has enough rounds left to make the attack
		if ( this.system.jammed ) {
			return ui.notifications.warn(game.i18n.localize("EH.Weapon.Action.Attack.Warning.Jammed"));
		}
		if ( this.system.usesRounds && (this.system.roundsToSpend > this.system.rounds?.available) ) {
			return ui.notifications.warn(game.i18n.localize("EH.Weapon.Action.Attack.Warning.Empty"));
		}

		// TODO: Thrown weapons with limited quantities should consume a quantity
		// But "returning" also needs to be taken into account (probably manually)

		const { parts, data } = buildRoll({
			mod: ability?.mod,
			prof: this.system.proficiency.hasProficiency ? this.system.proficiency.term : null,
			weaponBonus: this.system.bonuses.attack,
			ammoBonus: ammunition?.system.bonuses.attack,
			globalBonus: actor.system.bonuses?.attack?.all,
			globalMeleeBonus: actor.system.bonuses?.attack?.melee,
			globalRangedBonus: actor.system.bonuses?.attack?.ranged
		}, this.getRollData());

		const rollConfig = foundry.utils.mergeObject({
			data,
			options: {
				criticalSuccess: this.system.criticalThreshold
			}
		}, config);
		rollConfig.parts = parts.concat(config.parts ?? []);

		const flavor = this.system.attackTooltip;
		const messageConfig = foundry.utils.mergeObject({
			data: {
				title: `${flavor}: ${actor.name}`,
				flavor,
				speaker: ChatMessage.getSpeaker({ actor }),
				"flags.everyday-heroes.roll": {
					type: "attack",
					mode: this.system.mode,
					origin: this.uuid,
					ammunition: ammunition?.uuid,
					penetrationValue: this.system.penetrationValue + (ammunition?.system.penetrationValue ?? 0)
				}
			}
		}, message);

		const dialogConfig = foundry.utils.mergeObject({
			options: {
				title: game.i18n.format("EH.Roll.Configuration.LabelSpecific", {
					type: game.i18n.format("EH.Weapon.Action.AttackGeneric")
				})
			}
		}, dialog);

		/**
		 * A hook event that fires before an attack is rolled for an Item.
		 * @function everydayHeroes.preRollAttack
		 * @memberof hookEvents
		 * @param {ItemEH} item - Item that will attack.
		 * @param {ChallengeRollConfiguration} config - Configuration data for the pending roll.
		 * @param {BaseMessageConfiguration} message - Configuration data for the roll's message.
		 * @param {BaseDialogConfiguration} dialog - Presentation data for the roll configuration dialog.
		 * @returns {boolean} - Explicitly return `false` to prevent attack from being rolled.
		 */
		if ( Hooks.call("everydayHeroes.preRollAttack", this, rollConfig, messageConfig, dialogConfig) === false ) return;

		// Activate the weapon to consume any uses, if relevant
		const updates = await this.activate({deferConsumption: true});
		if ( !updates ) return;

		const rolls = await CONFIG.Dice.ChallengeRoll.build(rollConfig, messageConfig, dialogConfig);
		if ( !rolls?.length ) return;
		const roll = rolls[0];

		if ( this.system.roundsToSpend ) {
			updates.item["system.rounds.spent"] = this.system.rounds.spent += this.system.roundsToSpend;
		}
		if ( this.system.properties.has("unreliable") && roll.isCriticalFailure ) {
			updates.item["system.jammed"] = true;
		}

		/**
		 * A hook event that fires after an attack has been rolled for an Item.
		 * @function everydayHeroes.rollAttack
		 * @memberof hookEvents
		 * @param {ItemEH} item - Item that attacked.
		 * @param {ChallengeRoll[]} rolls - The resulting rolls.
		 * @param {ActivationUpdates} updates - Updates that will be applied to the actor & weapon.
		 */
		Hooks.callAll("everydayHeroes.rollAttack", this, rolls, updates);

		if ( !foundry.utils.isEmpty(updates.actor) ) await this.actor.update(updates.actor);
		if ( !foundry.utils.isEmpty(updates.item) ) await this.update(updates.item);
		if ( !foundry.utils.isEmpty(updates.resource) ) await this.actor.updateEmbeddedDocuments("Item", updates.resource);

		return roll;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Roll damage for this weapon or explosive.
	 * @param {DamageRollConfiguration} [config] - Configuration information for the roll.
	 * @param {BaseMessageConfiguration} [message] - Configuration data that guides roll message creation.
	 * @param {BaseDialogConfiguration} [dialog] - Presentation data for the roll configuration dialog.
	 * @returns {Promise<DamageRoll[]|void>}
	 */
	async rollDamage(config={}, message={}, dialog={}) {
		if ( !this.hasDamage ) return console.warn(`${this.name} does not support damage rolls.`);
		const actor = this.system.user !== undefined ? this.system.user : this.actor;
		const item = config.options?.mode ? this.clone({"system._modeOverride": config.options.mode}) : this;
		const ability = actor?.system.abilities[item.system.damageAbility];
		const ammunition = item.system.ammunition;

		const { parts, data } = buildRoll({
			mod: ability?.mod,
			weaponBonus: item.system.bonuses.damage,
			ammoBonus: ammunition?.system.bonuses.damage,
			globalBonus: actor?.system.bonuses?.damage?.all,
			[`global${item.system.type.value.capitalize()}Bonus`]: actor?.system.bonuses?.damage?.[item.system.type.value]
		}, this.getRollData());

		const rollConfig = foundry.utils.mergeObject({
			data,
			supplementalDamage: [],
			options: {
				mode: item.system.mode,
				allowCritical: ammunition ? ammunition.system.canCritical : item.system.canCritical,
				multiplier: actor?.system.overrides?.critical?.multiplier,
				bonusDamage: [item.system.bonuses.critical?.damage, ammunition?.system.bonuses.critical?.damage]
					.filter(d => d)
					.map(d => Roll.replaceFormulaData(d, data))
					.join(" + "),
				bonusDice: (item.system.bonuses.critical?.dice ?? 0) + (ammunition?.system.bonuses.critical?.dice ?? 0),
				type: item.system.damage.type === "multiple"
					? item.system.damage.alternateTypes.first()
					: item.system.damage.type,
				pv: item.system.penetrationValue
			}
		}, config);
		rollConfig.parts = [item.system.damage.dice].concat(parts).concat(config.parts ?? []);

		for ( const damage of item.system.supplementalDamage ) {
			const { parts, data } = buildRoll({ bonus: damage.bonus }, this.getRollData());
			rollConfig.supplementalDamage.push({
				data,
				parts: [damage.dice].concat(parts),
				options: {
					mode: "supplemental",
					allowCritical: rollConfig.options.allowCritical,
					multiplier: rollConfig.options.multiplier,
					type: damage.type,
					pv: damage.customPV ? damage.penetrationValue : undefined
				}
			});
		}

		const flavor = game.i18n.format("EH.Action.Roll", {
			type: game.i18n.format("EH.Weapon.Action.DamageSourced.Label", {source: this.name})
		});
		const messageConfig = foundry.utils.mergeObject({
			data: {
				title: `${flavor}: ${actor?.name ?? ""}`,
				flavor,
				speaker: ChatMessage.getSpeaker({ actor }),
				"flags.everyday-heroes.actions": item.system.damageChatActions,
				"flags.everyday-heroes.roll": {
					type: "damage",
					origin: this.uuid,
					ammunition: ammunition?.uuid
				}
			}
		}, message);

		const dialogConfig = foundry.utils.mergeObject({
			options: {
				title: game.i18n.format("EH.Roll.Configuration.LabelSpecific", {
					type: game.i18n.format("EH.Weapon.Action.DamageGeneric.Label")
				}),
				damageTypes: item.system.damage.type === "multiple" ? item.system.damage.alternateTypes : null
			}
		}, dialog);

		/**
		 * A hook event that fires before a damage is rolled for an Item.
		 * @function everydayHeroes.preRollDamage
		 * @memberof hookEvents
		 * @param {ItemEH} item - Item for which the roll is being performed.
		 * @param {DamageRollConfiguration} config - Configuration data for the pending roll.
		 * @param {BaseMessageConfiguration} message - Configuration data for the roll's message.
		 * @param {BaseDialogConfiguration} dialog - Presentation data for the roll configuration dialog.
		 * @returns {boolean} - Explicitly return false to prevent the roll from being performed.
		 */
		if ( Hooks.call("everydayHeroes.preRollDamage", this, rollConfig, messageConfig, dialogConfig) === false ) return;

		const rolls = await CONFIG.Dice.DamageRoll.build(rollConfig, messageConfig, dialogConfig);
		if ( !rolls ) return;

		/**
		 * A hook event that fires after a damage has been rolled for an Item.
		 * @function everydayHeroes.rollDamage
		 * @memberof hookEvents
		 * @param {ItemEH} item - Item for which the roll was performed.
		 * @param {DamageRoll[]} rolls - The resulting rolls.
		 */
		Hooks.callAll("everydayHeroes.rollDamage", this, rolls);

		return rolls;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Roll to recharge a feature.
	 * @param {BaseRollConfiguration} [config] - Configuration information for the roll.
	 * @param {BaseMessageConfiguration} [message] - Configuration data that guides roll message creation.
	 * @param {BaseDialogConfiguration} [dialog] - Presentation data for the roll configuration dialog.
	 * @returns {Promise<BaseRoll[]|void>}
	 */
	async rollRecharge(config={}, message={}, dialog={}) {
		if ( !this.system.recharge || this.system.recharge.charged || !this.system.recharge.target ) {
			return console.warn("Recharge cannot be rolled for this item.");
		}

		const rollConfig = foundry.utils.mergeObject({
			data: this.getRollData(),
			options: {
				target: this.system.recharge.target
			}
		}, config);
		rollConfig.parts = ["1d6"].concat(config.parts ?? []);

		const type = game.i18n.localize("EH.Recharge.Label");
		const flavor = game.i18n.format("EH.Action.Roll", { type });
		const messageConfig = foundry.utils.mergeObject({
			data: {
				title: `${flavor}: ${this.name}`,
				flavor,
				speaker: ChatMessage.getSpeaker({actor: this.actor}),
				"flags.everyday-heroes.roll": {
					type: "recharge"
				}
			}
		}, message);

		const dialogConfig = foundry.utils.mergeObject({
			configure: false,
			options: {
				title: game.i18n.format("EH.Roll.Configuration.LabelSpecific", { type })
			}
		}, dialog);

		/**
		 * A hook event that fires before a recharge is rolled for an Item.
		 * @function everydayHeroes.preRollRecharge
		 * @memberof hookEvents
		 * @param {ActorEH} actor - Item for which the recharge is being rolled.
		 * @param {ResourceRollConfiguration} config - Configuration data for the pending roll.
		 * @param {BaseMessageConfiguration} message - Configuration data for the roll's message.
		 * @param {BaseDialogConfiguration} dialog - Presentation data for the roll configuration dialog.
		 * @returns {boolean} - Explicitly return `false` to prevent recharge from being rolled.
		 */
		if ( Hooks.call("everydayHeroes.preRollRecharge", this, rollConfig, messageConfig, dialogConfig) === false ) return;

		const rolls = await CONFIG.Dice.BaseRoll.build(rollConfig, messageConfig, dialogConfig);
		const updates = {};
		if ( rolls[0]?.isSuccess ) updates["system.recharge.charged"] = true;

		/**
		 * A hook event that fires after a recharge has been rolled for an Item, but before the item has been updated.
		 * @function everydayHeroes.rollRecharge
		 * @memberof hookEvents
		 * @param {ActorEH} actor - Item for which the recharge has been rolled.
		 * @param {BaseRoll[]} rolls - The resulting rolls.
		 * @param {object} updates - Updates that will be applied to the item.
		 * @returns {boolean} - Explicitly return `false` to prevent any changes from being applied to the actor.
		 */
		if ( Hooks.call("everydayHeroes.rollRecharge", this, rolls, updates) === false ) return rolls;

		if ( !foundry.utils.isEmpty(updates) ) await this.update(updates);

		return rolls;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Socket Event Handlers                    */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async _preCreate(data, options, userId) {
		await super._preCreate(data, options, userId);

		if ( !data.img || data.img === this.constructor.DEFAULT_ICON ) {
			const img = this.system.constructor.metadata.image;
			if ( img ) this.updateSource({img});
		}
		if ( this.system.hasOwnProperty("identifier") && !this.system.identifier.value ) {
			this.updateSource({"system.identifier.value": this.identifier});
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_onDelete(options, userId) {
		super._onDelete(options, userId);
		if ( (userId !== game.user.id) || !this.parent ) return;

		// Clear actor/item relationship information
		if ( this.parent.system.items?.[this.id] ) {
			this.parent.update({[`system.items.-=${this.id}`]: null});
		}
	}
}
