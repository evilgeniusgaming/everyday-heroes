import RestDialog from "../applications/actor/dialogs/rest-dialog.mjs";
import { buildMinimum, buildRoll } from "../dice/utils.mjs";
import { numberFormat, simplifyBonus } from "../utils.mjs";
import Proficiency from "./proficiency.mjs";

/**
 * Extended version of `Actor` class to support Everyday Heroes features.
 */
export default class ActorEH extends Actor {
	constructor(data, context) {
		super(data, context);

		/**
		 * A collection of Document instances which should be reset whenever this document is updated.
		 * The keys of this object are the document UUIDs and the values are the and the Document instances.
		 * Each Document in this object will have its reset method called after prepareDerivedData.
		 * Care must be taken when registering items here to avoid infinite loops.
		 * @type {Object<Document>}
		 */
		Object.defineProperty(this, "linked", {
			value: {},
			configurable: false,
			writable: false,
			enumerable: false
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareData() {
		super.prepareData();
		this.items.forEach(i => i.system.prepareFinalData?.());
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareBaseData() {
		if ( game.release.generation < 11 ) this.system.prepareBaseData?.();
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	applyActiveEffects() {
		this.system.prepareEmbeddedData?.();
		return super.applyActiveEffects();
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedData() {
		if ( game.release.generation < 11 ) this.system.prepareDerivedData?.();
		for ( const doc of Object.values(this.linked ?? {}) ) {
			// TODO: Shouldn't need to check that this exists, but somehow this method is being called before the
			// constructor on synthetic actors from tokens. Possibly fixed with the new setup in v11.
			doc.reset();
			doc._sheet?.render();
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * @inheritdoc
	 * @param {object} [options]
	 * @param {boolean} [options.deterministic] - Whether to force deterministic values for data properties that could be
	 *                                            either a die term or a flat term.
	 */
	getRollData({ deterministic=false }={}) {
		const data = this.system.toObject(false);
		data.prof = new Proficiency(this.system.attributes?.prof ?? 0, 1);
		if ( deterministic ) data.prof = data.prof.flat;
		return data;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Resting                                  */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Configuration options for a rest.
	 *
	 * @typedef {object} RestConfiguration
	 * @property {string} type - Type of rest performed (e.g. "short" or "long").
	 * @property {boolean} dialog - Present a dialog window for any rest configuration.
	 * @property {boolean} chat - Should a chat message be created to summarize the results of the rest?
	 */

	/**
	 * Results from a rest operation.
	 *
	 * @typedef {object} RestResult
	 * @property {string} type - Type of rest performed (e.g. "short" or "long").
	 * @property {number} hitPointsDelta - Hit points recovered during the rest.
	 * @property {number} hitDiceDelta - Hit dice spent or recovered during the rest.
	 * @property {object} actorUpdates - Updates applied to the actor.
	 * @property {object[]} itemUpdates - Updates applied to the actor's items.
	 * @property {BaseRoll[]} rolls - Any rolls that occurred during the rest process, not including hit dice.
	 */

	/**
	 * Take a short rest, possibly spending hit dice and recovering resources and item uses.
	 * @param {RestConfiguration} [config={}] - Configuration options for a short rest.
	 * @returns {Promise<RestResult|void>} - Final result of the rest operation.
	 */
	async shortRest(config={}) {
		return this.rest(foundry.utils.mergeObject({ type: "short", dialog: true, chat: true }, config));
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Take a long rest, possibly recovering hit points, resources, and item uses.
	 * @param {RestConfiguration} [config={}] - Configuration options for a long rest.
	 * @returns {Promise<RestResult|void>} - Final result of the rest operation.
	 */
	async longRest(config={}) {
		return this.rest(foundry.utils.mergeObject({ type: "long", dialog: true, chat: true }, config));
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Perform all of the changes needed when the actor rests.
	 * @param {RestConfiguration} [config={}] - Configuration options for the rest.
	 * @param {object} [deltas={}] - Any changes that have been made earlier in the process.
	 * @returns {Promise<RestResult>} - Final result of the rest operation.
	 */
	async rest(config={}, deltas={}) {
		const initialHitDice = this.system.attributes.hd.spent;
		const initialHitPoints = this.system.attributes.hp.value;

		/**
		 * A hook event that fires before the rest dialog is shown.
		 * @function everydayHeroes.preRestConfiguration
		 * @memberof hookEvents
		 * @param {ActorEH} actor - The actor that is being rested.
		 * @param {RestConfiguration} config - Configuration options for the rest.
		 * @returns {boolean} - Explicitly return `false` to prevent the rest from being started.
		 */
		if ( Hooks.call("everydayHeroes.preRestConfiguration", this, config) === false ) return;

		const result = {
			type: config.type,
			deltas: {},
			actorUpdates: {},
			itemUpdates: [],
			rolls: []
		};
		if ( config.dialog ) {
			try { foundry.utils.mergeObject(result, await RestDialog.rest(this, config)); }
			catch(err) { return; }
		}

		/**
		 * A hook event that fires after the rest dialog is shown.
		 * @function everydayHeroes.restConfiguration
		 * @memberof hookEvents
		 * @param {ActorEH} actor - The actor that is being rested.
		 * @param {RestConfiguration} config - Configuration options for the rest.
		 * @param {RestResult} result - Details on the rest to be completed.
		 * @returns {boolean} - Explicitly return `false` to prevent the rest from being continued.
		 */
		if ( Hooks.call("everydayHeroes.restConfiguration", this, config, result) === false ) return;

		result.deltas.hitDice = (result.deltas.hitDice ?? 0) + initialHitDice - this.system.attributes.hd.spent;
		result.deltas.hitPoints = (result.deltas.hitPoints ?? 0) + this.system.attributes.hp.value - initialHitPoints;

		this._getRestHitDiceRecovery(config, result);
		this._getRestHitPointRecovery(config, result);
		this._getRestItemUseRecovery(config, result);
		this._getRestResourceRecovery(config, result);

		/**
		 * A hook event that fires after rest result is calculated, but before any updates are performed.
		 * @function everydayHeroes.preRestCompleted
		 * @memberof hookEvents
		 * @param {ActorEH} actor - The actor that is being rested.
		 * @param {RestResult} result - Details on the rest to be completed.
		 * @returns {boolean} - Explicitly return `false` to prevent the rest updates from being performed.
		 */
		if ( Hooks.call("everydayHeroes.preRestCompleted", this, result) === false ) return result;

		await this.update(result.actorUpdates);
		await this.updateEmbeddedDocuments("Item", result.itemUpdates);

		if ( chat ) await this._displayRestResultMessage(result);

		/**
		 * A hook event that fires when the rest process is completed for an actor.
		 * @function everydayHeroes.restCompleted
		 * @memberof hookEvents
		 * @param {ActorEH} actor - The actor that just completed resting.
		 * @param {RestResult} result - Details on the rest completed.
		 */
		Hooks.callAll("everydayHeroes.restCompleted", this, result);

		return result;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Does the provided recovery period get recovered with the provided rest configuration?
	 * @param {RestConfiguration} config - Configuration options for the rest.
	 * @param {string} period - Recovery period as defined in `CONFIG.EverydayHeroes.recoveryPeriods`.
	 * @returns {boolean}
	 * @internal
	 */
	_recoversOnPeriod(config, period) {
		if ( (period === "sr") && ["short", "long"].includes(config.type) ) return true;
		if ( (period === "lr") && (config.type === "long") ) return true;
		return false;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Perform any hit dice recover needed for this rest.
	 * @param {RestConfiguration} [config={}] - Configuration options for the rest.
	 * @param {RestResult} [result={}] - Rest result being constructed.
	 * @internal
	 */
	_getRestHitDiceRecovery(config={}, result={}) {
		if ( config.type !== "long" ) return;
		const hd = this.system.attributes.hd;
		const final = Math.clamped(hd.spent - Math.ceil(hd.max * hd.recovery), 0, hd.max);
		foundry.utils.mergeObject(result, {
			deltas: {
				hitDice: (result.deltas?.hitDice ?? 0) + hd.spent - final
			},
			actorUpdates: {
				"system.attributes.hd.spent": final
			}
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Perform any hit point recovery needed for this rest.
	 * @param {RestConfiguration} [config={}] - Configuration options for the rest.
	 * @param {RestResult} [result={}] - Rest result being constructed.
	 * @internal
	 */
	_getRestHitPointRecovery(config={}, result={}) {
		if ( config.type !== "long" ) return;
		const hp = this.system.attributes.hp;
		foundry.utils.mergeObject(result, {
			deltas: {
				hitPoints: (result.deltas?.hitPoints ?? 0) + hp.max - hp.value
			},
			actorUpdates: {
				"system.attributes.hp.value": hp.max,
				"system.attributes.hp.temp": 0
			}
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Perform any recovery of item uses for this rest.
	 * @param {RestConfiguration} [config={}] - Configuration options for the rest.
	 * @param {RestResult} [result={}] - Rest result being constructed.
	 * @internal
	 */
	_getRestItemUseRecovery(config={}, result={}) {
		for ( const item of this.items ) {
			const updates = result.itemUpdates.findSplice(i => i._id === item.id) ?? {};
			const uses = item.system.uses;
			if ( uses?.spent && this._recoversOnPeriod(config, uses?.period) ) {
				// TODO: Handle recovery formula
				updates["system.uses.spent"] = 0;
			}
			if ( !foundry.utils.isEmpty(updates) ) {
				updates._id = item.id;
				result.itemUpdates.push(updates);
			}
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Perform any resource recovery for this rest.
	 * @param {RestConfiguration} [config={}] - Configuration options for the rest.
	 * @param {RestResult} [result={}] - Rest result being constructed.
	 * @internal
	 */
	_getRestResourceRecovery(config={}, result={}) {
		const actorUpdates = {};
		for ( const [key, resource] of Object.entries(this.system.resources) ) {
			const period = resource.recovery?.period;
			if ( !this._recoversOnPeriod(config, period) ) continue;
			// TODO: Handle recovery formulas
			actorUpdates[`system.resources.${key}.spent`] = 0;
		}
		foundry.utils.mergeObject(result, { actorUpdates });
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Display the result of a rest operation in chat.
	 * @param {RestResult} result - Results of the rest.
	 * @returns {Promise<ChatMessage>}
	 * @internal
	 */
	async _displayRestResultMessage(result) {
		const type = result.type === "short" ? "Short" : "Long";

		// Determine what localization string should be used for the message content
		let resultType = "Basic";
		if ( result.deltas.hitPoints && result.deltas.hitDice ) resultType = "Full";
		else if ( (result.type === "long") && result.deltas.hitPoints ) resultType = "HitPoints";
		else if ( (result.type === "long") && result.deltas.hitDice ) resultType = "HitDice";
		const localizationString = `EH.Rest.Result.${type}.${resultType}`;

		// Prepare localization data
		const pluralRules = new Intl.PluralRules(game.i18n.lang);
		const localizationData = {
			name: this.name,
			hitDice: numberFormat(result.type === "long" ? result.deltas.hitDice : -result.deltas.hitDice),
			hitDiceLabel: game.i18n.localize(`EH.HitDice.Label[${pluralRules.select(result.deltas.hitDice)}]`).toLowerCase(),
			hitPoints: numberFormat(result.deltas.hitPoints),
			hitPointsLabel: game.i18n.localize(`EH.HitPoints.Label[${pluralRules.select(result.deltas.hitPoints)}]`)
				.toLowerCase()
		};

		const chatData = {
			user: game.user.id,
			speaker: {actor: this, alias: this.name},
			flavor: game.i18n.localize(`EH.Rest.Type.${type}.Label`),
			rolls: result.rolls,
			content: game.i18n.format(localizationString, localizationData)
		};
		ChatMessage.applyRollMode(chatData, game.settings.get("core", "rollMode"));
		return ChatMessage.create(chatData);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Rolling                                  */
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
		switch (type) {
			case "ability-check":
				return this.rollAbilityCheck(config, message, dialog);
			case "ability-save":
				return this.rollAbilitySave(config, message, dialog);
			case "death-save":
				return this.rollDeathSave(config, message, dialog);
			case "hit-die":
				return this.rollHitDie(config, message, dialog);
			case "initiative":
				return this.configureInitiativeRoll(config, message, dialog);
			case "luck":
				return this.rollLuckSave(config, message, dialog);
			case "resource":
				return this.rollResource(config, message, dialog);
			case "skill":
				return this.rollSkill(config, message, dialog);
			default:
				if ( foundry.utils.getType(this.system.roll) === "function" ) {
					return this.system.roll(type, config, message, dialog);
				} else {
					return console.warn(`Everyday Heroes | Invalid roll type clicked ${type}.`);
				}
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Configuration information for an ability roll.
	 *
	 * @typedef {ChallengeRollConfiguration} AbilityRollConfiguration
	 * @property {string} ability - The ability to be rolled.
	 */

	/**
	 * Roll an ability check.
	 * @param {AbilityRollConfiguration} [config] - Configuration information for the roll.
	 * @param {BaseMessageConfiguration} [message] - Configuration data that guides roll message creation.
	 * @param {BaseDialogConfiguration} [dialog] - Presentation data for the roll configuration dialog.
	 * @returns {Promise<ChallengeRoll[]|void>}
	 */
	async rollAbilityCheck(config={}, message={}, dialog={}) {
		const ability = this.system.abilities[config.ability];
		if ( !ability ) return;

		const { parts, data } = buildRoll({
			mod: ability.mod,
			prof: ability.checkProficiency?.hasProficiency ? ability.checkProficiency.term : null,
			bonus: ability.bonuses?.check,
			globalBonus: this.system.bonuses?.ability?.check
		}, this.getRollData());

		const rollConfig = foundry.utils.mergeObject({
			data,
			options: {
				minimum: buildMinimum([ability.minimums?.check, this.system.overrides?.ability?.minimums.check], data)
			}
		}, config);
		rollConfig.parts = parts.concat(config.parts ?? []);

		const type = game.i18n.format("EH.Ability.Action.CheckSpecific", {
			ability: CONFIG.EverydayHeroes.abilities[config.ability].label
		});
		const flavor = game.i18n.format("EH.Action.Roll", { type });
		const messageConfig = foundry.utils.mergeObject({
			data: {
				title: `${flavor}: ${this.name}`,
				flavor,
				speaker: ChatMessage.getSpeaker({actor: this}),
				"flags.everyday-heroes.roll": {
					type: "ability-check",
					ability: config.ability
				}
			}
		}, message);

		const dialogConfig = foundry.utils.mergeObject({
			options: {
				title: game.i18n.format("EH.Roll.Configuration.LabelSpecific", { type })
			}
		}, dialog);

		/**
		 * A hook event that fires before an ability check is rolled for an Actor.
		 * @function everydayHeroes.preRollAbilityCheck
		 * @memberof hookEvents
		 * @param {ActorEH} actor - Actor for which the ability check is being rolled.
		 * @param {ChallengeRollConfiguration} config - Configuration data for the pending roll.
		 * @param {BaseMessageConfiguration} message - Configuration data for the roll's message.
		 * @param {BaseDialogConfiguration} dialog - Presentation data for the roll configuration dialog.
		 * @returns {boolean} - Explicitly return `false` to prevent ability check from being rolled.
		 */
		if ( Hooks.call("everydayHeroes.preRollAbilityCheck", this, rollConfig, messageConfig, dialogConfig) === false ) return;

		const rolls = await CONFIG.Dice.ChallengeRoll.build(rollConfig, messageConfig, dialogConfig);

		/**
		 * A hook event that fires after an ability check has been rolled for an Actor.
		 * @function everydayHeroes.rollAbilityCheck
		 * @memberof hookEvents
		 * @param {ActorEH} actor - Actor for which the ability check has been rolled.
		 * @param {ChallengeRoll[]} rolls - The resulting rolls.
		 * @param {string} ability - ID of the ability that was rolled as defined in `CONFIG.EverydayHeroes.abilities`.
		 */
		if ( rolls?.length ) Hooks.callAll("everydayHeroes.rollAbilityCheck", this, rolls, config.ability);

		return rolls;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Roll an ability saving throw.
	 * @param {AbilityRollConfiguration} [config] - Configuration information for the roll.
	 * @param {BaseMessageConfiguration} [message] - Configuration data that guides roll message creation.
	 * @param {BaseDialogConfiguration} [dialog] - Presentation data for the roll configuration dialog.
	 * @returns {Promise<ChallengeRoll[]|void>}
	 */
	async rollAbilitySave(config={}, message={}, dialog={}) {
		const ability = this.system.abilities[config.ability];
		if ( !ability ) return;

		const { parts, data } = buildRoll({
			mod: ability.mod,
			prof: ability.saveProficiency?.hasProficiency ? ability.saveProficiency.term : null,
			bonus: ability.bonuses?.save,
			globalBonus: this.system.bonuses?.ability?.save
		}, this.getRollData());

		const rollConfig = foundry.utils.mergeObject({
			data,
			options: {
				minimum: buildMinimum([ability.minimums?.save, this.system.overrides?.ability?.minimums.save], data)
			}
		}, config);
		rollConfig.parts = parts.concat(config.parts ?? []);

		const type = game.i18n.format("EH.Ability.Action.SaveSpecificLong", {
			ability: CONFIG.EverydayHeroes.abilities[config.ability].label
		});
		const flavor = game.i18n.format("EH.Action.Roll", { type });
		const messageConfig = foundry.utils.mergeObject({
			data: {
				title: `${flavor}: ${this.name}`,
				flavor,
				speaker: ChatMessage.getSpeaker({actor: this}),
				"flags.everyday-heroes.roll": {
					type: "ability-save",
					ability: config.ability
				}
			}
		}, message);

		const dialogConfig = foundry.utils.mergeObject({
			options: {
				title: game.i18n.format("EH.Roll.Configuration.LabelSpecific", { type })
			}
		}, dialog);

		/**
		 * A hook event that fires before an ability save is rolled for an Actor.
		 * @function everydayHeroes.preRollAbilitySave
		 * @memberof hookEvents
		 * @param {ActorEH} actor - Actor for which the ability save is being rolled.
		 * @param {ChallengeRollConfiguration} config - Configuration data for the pending roll.
		 * @param {BaseMessageConfiguration} message - Configuration data for the roll's message.
		 * @param {BaseDialogConfiguration} dialog - Presentation data for the roll configuration dialog.
		 * @returns {boolean} - Explicitly return `false` to prevent ability save from being rolled.
		 */
		if ( Hooks.call("everydayHeroes.preRollAbilitySave", this, rollConfig, messageConfig, dialogConfig) === false ) return;

		const rolls = await CONFIG.Dice.ChallengeRoll.build(rollConfig, messageConfig, dialogConfig);

		/**
		 * A hook event that fires after an ability save has been rolled for an Actor.
		 * @function everydayHeroes.rollAbilitySave
		 * @memberof hookEvents
		 * @param {ActorEH} actor - Actor for which the ability save has been rolled.
		 * @param {ChallengeRoll[]} rolls - The resulting rolls.
		 * @param {string} ability - ID of the ability that was rolled as defined in `CONFIG.EverydayHeroes.abilities`.
		 */
		if ( rolls?.length ) Hooks.callAll("everydayHeroes.rollAbilitySave", this, rolls, config.ability);

		return rolls;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Configuration data for death saving throw rolls.
	 *
	 * @typedef {ChallengeRollConfiguration} DeathSaveRollConfiguration
	 * @property {number} [successThreshold] - Number of successes required to stabilize.
	 * @property {number} [failureThreshold] - Number of failures required to die.
	 */

	/**
	 * Roll a death saving throw.
	 * @param {DeathSaveRollConfiguration} [config] - Configuration information for the roll.
	 * @param {BaseMessageConfiguration} [message] - Configuration data that guides roll message creation.
	 * @param {BaseDialogConfiguration} [dialog] - Presentation data for the roll configuration dialog.
	 * @returns {Promise<ChallengeRoll[]|void>}
	 */
	async rollDeathSave(config={}, message={}, dialog={}) {
		const death = this.system.attributes.death;

		const { parts, data } = buildRoll({
			bonus: death.bonus,
			globalBonus: this.system.bonuses?.ability?.save
		}, this.getRollData());

		const rollConfig = foundry.utils.mergeObject({
			data,
			successThreshold: death.overrides.success
				? death.overrides.success : CONFIG.EverydayHeroes.deathSave.successThreshold,
			failureThreshold: death.overrides.failure
				? death.overrides.failure : CONFIG.EverydayHeroes.deathSave.failureThreshold,
			options: {
				minimum: buildMinimum([this.system.overrides?.ability?.minimums.save], data),
				target: death.overrides.target ? death.overrides.target : CONFIG.EverydayHeroes.deathSave.target
			}
		}, config);
		rollConfig.parts = parts.concat(config.parts ?? []);

		const type = game.i18n.localize("EH.Death.Label[one]");
		const flavor = game.i18n.format("EH.Action.Roll", { type });
		const messageConfig = foundry.utils.mergeObject({
			data: {
				title: `${flavor}: ${this.name}`,
				flavor,
				speaker: ChatMessage.getSpeaker({actor: this}),
				"flags.everyday-heroes.roll": {
					type: "death-save"
				}
			}
		}, message);

		const dialogConfig = foundry.utils.mergeObject({
			options: {
				title: game.i18n.format("EH.Roll.Configuration.LabelSpecific", { type })
			}
		}, dialog);

		/**
		 * A hook event that fires before an death save is rolled for an Actor.
		 * @function everydayHeroes.preRollDeathSave
		 * @memberof hookEvents
		 * @param {ActorEH} actor - Actor for which the death save is being rolled.
		 * @param {DeathSaveRollConfiguration} config - Configuration data for the pending roll.
		 * @param {BaseMessageConfiguration} message - Configuration data for the roll's message.
		 * @param {BaseDialogConfiguration} dialog - Presentation data for the roll configuration dialog.
		 * @returns {boolean} - Explicitly return `false` to prevent death save from being rolled.
		 */
		if ( Hooks.call("everydayHeroes.preRollDeathSave", this, rollConfig, messageConfig, dialogConfig) === false ) return;

		const rolls = await CONFIG.Dice.ChallengeRoll.build(rollConfig, messageConfig, dialogConfig);
		if ( !rolls?.length ) return;
		const roll = roll[0];

		const details = {};

		// Save success
		if ( roll.total >= (roll.options.target ?? CONFIG.EverydayHeroes.deathSave.target) ) {
			let successes = (death.success || 0) + 1;

			// Critical success, you're back up!
			if ( roll.isCriticalSuccess ) {
				details.updates = {
					"system.attributes.death.status": "alive",
					"system.attributes.death.success": 0,
					"system.attributes.death.failure": 0,
					"system.attributes.hp.value": 1
				};
				details.chatString = "EH.Death.Message.CriticalSuccess";
			}

			// Three successes, you're stabilized
			else if ( successes >= rollConfig.successThreshold ) {
				details.updates = {
					"system.attributes.death.status": "stable",
					"system.attributes.death.success": 0,
					"system.attributes.death.failure": 0
				};
				details.chatString = "EH.Death.Message.Success";
				details.count = rollConfig.successThreshold;
			}

			// Increment successes
			else details.updates = {
				"system.attributes.death.success": Math.clamped(successes, 0, rollConfig.successThreshold)
			};
		}

		// Save failure
		else {
			let failures = (death.failure || 0) + (roll.isCriticalFailure ? 2 : 1);
			details.updates = {
				"system.attributes.death.failure": Math.clamped(failures, 0, rollConfig.failureThreshold)
			};
			// Three failures, you're dead
			if ( failures >= rollConfig.failureThreshold ) {
				details.updates["system.attributes.death.status"] = "dead";
				details.chatString = "EH.Death.Message.Failure";
				details.count = rollConfig.failureThreshold;
			}
		}

		/**
		 * A hook event that fires after a death saving throw has been rolled for an Actor, but before
		 * updates have been performed.
		 * @function everydayHeroes.rollDeathSave
		 * @memberof hookEvents
		 * @param {ActorEH} actor - Actor for which the death saving throw has been rolled.
		 * @param {ChallengeRoll[]} rolls - The resulting rolls.
		 * @param {object} details
		 * @param {object} details.updates - Updates that will be applied to the actor as a result of this save.
		 * @param {string} details.chatString - Localizable string displayed in the create chat message. If not set,
		 *                                      then no chat message will be displayed.
		 * @param {number} details.count - Number of rolls succeeded or failed to result in this message.
		 * @returns {boolean} - Explicitly return `false` to prevent updates from being performed.
		 */
		if ( Hooks.call("everydayHeroes.rollDeathSave", this, rolls, details) === false ) return roll;

		if ( !foundry.utils.isEmpty(details.updates) ) await this.update(details.updates);

		// Display success/failure chat message
		if ( details.chatString ) {
			const pluralRule = (new Intl.PluralRules(game.i18n.lang)).select(details.count);
			const numberFormatter = new Intl.NumberFormat(game.i18n.lang);
			const counted = game.i18n.format("EH.Death.Message.Counted", {
				count: numberFormatter.format(details.count),
				label: game.i18n.localize(`EH.Death.Message.Label[${pluralRule}]`)
			});
			let chatData = {
				content: game.i18n.format(details.chatString, {name: this.name, counted}),
				speaker: messageConfig.data.speaker
			};
			ChatMessage.applyRollMode(chatData, roll.options.rollMode);
			await ChatMessage.create(chatData);
		}

		return rolls;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Configuration data for a hit die roll.
	 *
	 * @typedef {BaseRollConfiguration} HitDieRollConfiguration
	 * @property {boolean} [advantage=false] - Should two hit dice be rolled and the highest taken?
	 * @property {boolean} [modifySpentHitDie=true] - Should the actor's spent hit die count be updated?
	 * @property {boolean} [modifyHitPoints=true] - Should the actor's hit points be updated after the roll?
	 */

	/**
	 * Roll one of the actor's hit die and add its value to their health.
	 * @param {HitDieRollConfiguration} [config] - Configuration information for the roll.
	 * @param {BaseMessageConfiguration} [message] - Configuration data that guides roll message creation.
	 * @param {BaseDialogConfiguration} [dialog] - Presentation data for the roll configuration dialog.
	 * @returns {Promise<BaseRoll[]|void>}
	 */
	async rollHitDie(config={}, message={}, dialog={}) {
		const denomination = this.system.attributes.hd.denomination;
		if ( !denomination ) return console.warn("No hit die set up");
		if ( !this.system.attributes.hd.available ) return console.warn("No hit dice to spend");
		// TODO: Show UI warning message for both of these

		const min = simplifyBonus(this.system.attributes.hd.minimum, this.getRollData()) || 0;
		const num = config.advantage ? 2 : 1;
		const mod = config.advantage ? "kh" : "";
		const rollConfig = foundry.utils.mergeObject({
			fastForward: true,
			parts: [
				`max(${min}, ${num}d${denomination}${mod} + @abilities.${CONFIG.EverydayHeroes.defaultAbilities.hitPoints}.mod)`
			],
			data: this.getRollData()
		}, config);

		const type = game.i18n.localize("EH.HitDice.Label[one]");
		const flavor = game.i18n.format("EH.Action.Roll", {type});
		const messageConfig = foundry.utils.mergeObject({
			data: {
				title: `${flavor}: ${this.name}`,
				flavor,
				speaker: ChatMessage.getSpeaker({actor: this}),
				"flags.everyday-heroes.roll": {
					type: "hit-dice",
					denomination
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
		 * A hook event that fires before a hit die is rolled for an Actor.
		 * @function everydayHeroes.preRollHitDie
		 * @memberof hookEvents
		 * @param {ActorEH} actor - Actor for which the hit die is to be rolled.
		 * @param {HitDieRollConfiguration} config - Configuration data for the pending roll.
		 * @param {BaseMessageConfiguration} message - Configuration data for the roll's message.
		 * @param {BaseDialogConfiguration} dialog - Presentation data for the roll configuration dialog.
		 * @param {number} denomination - Size of hit die to be rolled.
		 * @returns {boolean} - Explicitly return `false` to prevent hit die from being rolled.
		 */
		if ( Hooks.call("everydayHeroes.preRollHitDie", this, rollConfig, messageConfig,
			dialogConfig, denomination) === false ) return;

		const rolls = await CONFIG.Dice.BaseRoll.build(rollConfig, messageConfig, dialogConfig);

		const updates = {};
		if ( rollConfig.modifySpentHitDie !== false ) {
			updates["system.attributes.hd.spent"] = this.system.attributes.hd.spent + 1;
		}
		if ( rollConfig.modifyHitPoints !== false ) {
			const hp = this.system.attributes.hp;
			updates["system.attributes.hp.value"] = Math.min(hp.max, hp.value + (rolls[0]?.total ?? 0));
		}

		/**
		 * A hook event that fires after a hit die has been rolled for an Actor, but before updates have been performed.
		 * @function everydayHeroes.rollHitDie
		 * @memberof hookEvents
		 * @param {ActorEH} actor - Actor for which the hit die has been rolled.
		 * @param {BaseRoll[]} rolls - The resulting rolls.
		 * @param {object} updates - Updates that will be applied to the actor.
		 * @returns {boolean} - Explicitly return `false` to prevent updates from being performed.
		 */
		if ( Hooks.call("everydayHeroes.rollHitDie", this, rolls, updates) === false ) return rolls;

		if ( !foundry.utils.isEmpty(updates) ) await this.update(updates);

		return rolls;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Roll hit points on level-up or re-roll NPC max hit points.
	 * @param {BaseRollConfiguration} config - Configuration information for the roll.
	 * @param {BaseMessageConfiguration} message - Configuration data that guides roll message creation.
	 * @param {BaseDialogConfiguration} dialog - Presentation data for the roll configuration dialog.
	 * @returns {Promise<BaseRoll[]|void>}
	 */
	async rollHitPoints(config={}, message={}, dialog={}) {
		// Hero Hit Points
		if ( this.type === "hero" ) {
			const denomination = this.system.attributes.hd.denomination;
			if ( !denomination ) return console.warn("No hit die set up");

			const parts = [`1d${denomination}`];
			const data = this.getRollData();

			const rollConfig = foundry.utils.mergeObject({ data }, config);
			rollConfig.parts = parts.concat(config.parts ?? []);

			const type = game.i18n.localize("EH.HitPoints.Label[other]");
			const flavor = game.i18n.format("EH.Action.Roll", { type });
			const messageConfig = foundry.utils.mergeObject({
				data: {
					title: `${flavor}: ${this.name}`,
					flavor,
					speaker: ChatMessage.getSpeaker({actor: this}),
					"flags.everyday-heroes.roll": {
						type: "hit-points"
					}
				}
			});

			const dialogConfig = foundry.utils.mergeObject({
				configure: false,
				options: {
					title: game.i18n.format("EH.Roll.Configuration.LabelSpecific", { type })
				}
			}, dialog);

			/**
			 * A hook event that fires before hit points are rolled for an Hero.
			 * @function everydayHeroes.preRollHeroHitPoints
			 * @memberof hookEvents
			 * @param {ActorEH} actor - Actor for which the hit points are being rolled.
			 * @param {ChallengeRollConfiguration} config - Configuration data for the pending roll.
			 * @param {BaseMessageConfiguration} message - Configuration data for the roll's message.
			 * @param {BaseDialogConfiguration} dialog - Presentation data for the roll configuration dialog.
			 * @returns {boolean} - Explicitly return `false` to prevent hit points from being rolled.
			 */
			if ( Hooks.call("everydayHeroes.preRollHeroHitPoints", this, rollConfig,
				messageConfig, dialogConfig) === false ) return;

			const rolls = await CONFIG.Dice.BaseRoll.build(rollConfig, messageConfig, dialogConfig);

			/**
			 * A hook event that fires after hit points have been rolled for an Actor.
			 * @function everydayHeroes.rollHeroHitPoints
			 * @memberof hookEvents
			 * @param {ActorEH} actor - Actor for which the hit points have been rolled.
			 * @param {BaseRoll[]} rolls - The resulting rolls.
			 */
			Hooks.callAll("everydayHeroes.rollHeroHitPoints", this, rolls);

			return rolls;
		}

		// NPC Hit Points
		else {
			// TODO: Implement NPC hit points rolling
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Construct an initiative roll.
	 * @param {ChallengeRollOptions} [options] - Options for the roll.
	 * @returns {ChallengeRollConfiguration}
	 */
	getInitiativeRollConfig(options={}) {
		const init = this.system.attributes?.initiative ?? {};
		const abilityKey = init.ability ?? CONFIG.EverydayHeroes.defaultAbilities.initiative;
		const ability = this.system.abilities?.[abilityKey] ?? {};

		const { parts, data } = buildRoll({
			mod: ability.mod,
			prof: init.prof?.hasProficiency ? init.prof.term : null,
			bonus: init.bonus,
			[`${abilityKey}Bonus`]: ability.bonuses?.check,
			globalBonus: this.system.bonuses?.ability?.check,
			tiebreaker: (game.settings.get("everyday-heroes", "initiativeTiebreaker") && ability) ? ability.value / 100 : null
		}, this.getRollData());

		const rollOptions = foundry.utils.mergeObject({
			minimum: buildMinimum([
				ability?.minimums.check, this.system.overrides?.ability?.minimums.check
			], data)
		}, options);

		const rollConfig = { data, parts, options: rollOptions };

		/**
		 * A hook event that fires when initiative roll configuration is being prepared.
		 * @function everydayHeroes.initiativeConfig
		 * @memberof hookEvents
		 * @param {ActorEH} actor - Actor for which the initiative is being configured.
		 * @param {ChallengeRollConfiguration} config - Configuration data for the pending roll.
		 */
		Hooks.callAll("everydayHeroes.initiativeConfig", this, rollConfig);

		return rollConfig;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Present the initiative roll configuration dialog and then roll initiative.
	 * @param {ChallengeRollConfiguration} [config] - Configuration information for the roll.
	 * @param {BaseMessageConfiguration} message - Configuration data that guides roll message creation (ignored).
	 * @param {BaseDialogConfiguration} [dialog] - Presentation data for the roll configuration dialog.
	 * @returns {Promise<Combat|void>}
	 */
	async configureInitiativeRoll(config={}, message={}, dialog={}) {
		const rollConfig = foundry.utils.mergeObject(this.getInitiativeRollConfig(config.options), config);

		const dialogConfig = foundry.utils.mergeObject({
			options: {
				title: game.i18n.format("EH.Roll.Configuration.LabelSpecific", {
					type: game.i18n.localize("EH.Initiative.Label")
				})
			}
		}, dialog);

		const Roll = CONFIG.Dice.ChallengeRoll;
		Roll.applyKeybindings(rollConfig, dialogConfig);

		let roll;
		if ( dialogConfig.configure ) {
			try {
				roll = (await Roll.ConfigurationDialog.configure(rollConfig, dialogConfig))?.[0];
			} catch(err) {
				if ( !err ) return;
				throw err;
			}
		} else {
			roll = Roll.create(rollConfig)[0];
		}

		this._cachedInitiativeRoll = roll;
		await this.rollInitiative({createCombatants: true});
		delete this._cachedInitiativeRoll;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async rollInitiative(options={}) {
		/**
		 * A hook event that fires before initiative is rolled for an Actor.
		 * @function everydayHeroes.preRollInitiative
		 * @memberof hookEvents
		 * @param {ActorEH} actor - Actor for which the initiative is being rolled.
		 * @param {ChallengeRoll} roll - The initiative roll.
		 * @returns {boolean} - Explicitly return `false` to prevent initiative from being rolled.
		 */
		if ( Hooks.call("everydayHeroes.preRollInitiative", this, this._cachedInitiativeRoll) === false ) return;

		const combat = await super.rollInitiative(options);
		const combatants = this.isToken ? this.getActiveTokens(false, true)
			.filter(t => game.combat.getCombatantByToken(t.id)) : [game.combat.getCombatantByActor(this.id)];

		/**
		 * A hook event that fires after an Actor has rolled for initiative.
		 * @function everydayHeroes.rollInitiative
		 * @memberof hookEvents
		 * @param {ActorEH} actor - The Actor that has rolled initiative.
		 * @param {CombatantEH[]} combatants - The associated Combatants in the Combat.
		 */
		Hooks.callAll("everydayHeroes.rollInitiative", this, combatants);

		return combat;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Roll a luck saving throw.
	 * @param {ChallengeRollConfiguration} [config] - Configuration information for the roll.
	 * @param {BaseMessageConfiguration} [message] - Configuration data that guides roll message creation.
	 * @param {BaseDialogConfiguration} [dialog] - Presentation data for the roll configuration dialog.
	 * @returns {Promise<ChallengeRoll[]|void>}
	 */
	async rollLuckSave(config={}, message={}, dialog={}) {
		const { parts, data } = buildRoll({
			globalBonus: this.system.bonuses?.ability?.save
		}, this.getRollData());

		const rollConfig = foundry.utils.mergeObject({
			data,
			options: {
				minimum: buildMinimum([this.system.overrides?.ability?.minimums.save], data),
				target: 11
			}
		}, config);
		rollConfig.parts = parts.concat(config.parts ?? []);

		const type = game.i18n.format("EH.Luck.Label");
		const flavor = game.i18n.format("EH.Action.Roll", { type });
		const messageConfig = foundry.utils.mergeObject({
			data: {
				title: `${flavor}: ${this.name}`,
				flavor,
				speaker: ChatMessage.getSpeaker({actor: this}),
				"flags.everyday-heroes.roll": {
					type: "luck"
				}
			}
		}, message);

		const dialogConfig = foundry.utils.mergeObject({
			options: {
				title: game.i18n.format("EH.Roll.Configuration.LabelSpecific", { type })
			}
		}, dialog);

		/**
		 * A hook event that fires before an luck save is rolled for an Actor.
		 * @function everydayHeroes.preRollLuckSave
		 * @memberof hookEvents
		 * @param {ActorEH} actor - Actor for which the luck save is being rolled.
		 * @param {ChallengeRollConfiguration} config - Configuration data for the pending roll.
		 * @param {BaseMessageConfiguration} message - Configuration data for the roll's message.
		 * @param {BaseDialogConfiguration} dialog - Presentation data for the roll configuration dialog.
		 * @returns {boolean} - Explicitly return `false` to prevent ability save from being rolled.
		 */
		if ( Hooks.call("everydayHeroes.preRollLuckSave", this, rollConfig, messageConfig, dialogConfig) === false ) return;

		const rolls = await CONFIG.Dice.ChallengeRoll.build(rollConfig, messageConfig, dialogConfig);

		/**
		 * A hook event that fires after an luck save has been rolled for an Actor.
		 * @function everydayHeroes.rollLuckSave
		 * @memberof hookEvents
		 * @param {ActorEH} actor - Actor for which the luck save has been rolled.
		 * @param {ChallengeRoll[]} rolls - The resulting rolls.
		 */
		if ( rolls?.length ) Hooks.callAll("everydayHeroes.rollLuckSave", this, rolls);

		return rolls;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Configuration information for a resource roll.
	 *
	 * @typedef {BaseRollConfiguration} ResourceRollConfiguration
	 * @property {string} resource - The resource to be rolled.
	 * @property {number} [diceNumber=1] - Number of dice rolled.
	 * @property {number} [consumed=1] - Number of this resource consumed.
	 */

	/**
	 * Roll a resource die (if resource has a die) and spend a use.
	 * @param {ResourceRollConfiguration} [config] - Configuration information for the roll.
	 * @param {BaseMessageConfiguration} [message] - Configuration data that guides roll message creation.
	 * @param {BaseDialogConfiguration} [dialog] - Presentation data for the roll configuration dialog.
	 * @returns {Promise<BaseRoll[]|void>}
	 */
	async rollResource(config={}, message={}, dialog={}) {
		const resource = this.system.resources[config.resource];
		if ( !resource ) return console.warn(`Resource "${config.resource}" not found`);

		const rollConfig = foundry.utils.mergeObject({
			diceNumber: 1,
			consumed: 1,
			data: this.getRollData()
		}, config);
		const parts = resource.denomination ? [`${rollConfig.diceNumber ?? 1}d${resource.denomination}`] : [];
		rollConfig.parts = parts.concat(config.parts ?? []);

		// Verify there is a enough remaining uses to spent this resource
		if ( resource.available < rollConfig.consumed ) {
			const type = resource.available ? "Some" : "None";
			return ui.notifications.warn(game.i18n.format(`EH.Consumption.Warning.Insufficient${type}`, {
				resource: resource.label, available: resource.available, required: rollConfig.consumed
			}));
		}

		const type = resource.label;
		const flavor = game.i18n.format("EH.Action.Roll", { type });
		const messageConfig = foundry.utils.mergeObject({
			data: {
				title: `${flavor}: ${this.name}`,
				flavor,
				speaker: ChatMessage.getSpeaker({actor: this}),
				"flags.everyday-heroes.roll": {
					type: "resource",
					resource: rollConfig.resource
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
		 * A hook event that fires before an resource is rolled for an Actor.
		 * @function everydayHeroes.preRollResource
		 * @memberof hookEvents
		 * @param {ActorEH} actor - Actor for which the resource is being rolled.
		 * @param {ResourceRollConfiguration} config - Configuration data for the pending roll.
		 * @param {BaseMessageConfiguration} message - Configuration data for the roll's message.
		 * @param {BaseDialogConfiguration} dialog - Presentation data for the roll configuration dialog.
		 * @returns {boolean} - Explicitly return `false` to prevent resource from being rolled.
		 */
		if ( Hooks.call("everydayHeroes.preRollResource", this, rollConfig, messageConfig, dialogConfig) === false ) return;

		const rolls = rollConfig.parts.length
			? await CONFIG.Dice.BaseRoll.build(rollConfig, messageConfig, dialogConfig) : undefined;
		const updates = rollConfig.consumed ? {
			[`system.resources.${rollConfig.resource}.spent`]: resource.spent + rollConfig.consumed
		} : {};

		/**
		 * A hook event that fires after a resource has been rolled for an Actor, but before the resource has been spent.
		 * @function everydayHeroes.rollResource
		 * @memberof hookEvents
		 * @param {ActorEH} actor - Actor for which the resource has been rolled.
		 * @param {BaseRoll[]} rolls - The resulting rolls, if any were performed.
		 * @param {string} resource - ID of the resource that was rolled.
		 * @param {object} updates - Updates that will be applied to the actor.
		 * @returns {boolean} - Explicitly return `false` to prevent any changes from being applied to the actor.
		 */
		if ( Hooks.call("everydayHeroes.rollResource", this, rolls, rollConfig.resource, updates) === false ) return rolls;

		if ( !foundry.utils.isEmpty(updates) ) await this.update(updates);

		return rolls;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Configuration information for a skill roll.
	 *
	 * @typedef {ChallengeRollConfiguration} SkillRollConfiguration
	 * @property {string} skill - The skill to roll.
	 * @property {string} [ability] - The ability to be rolled with the skill.
	 */

	/**
	 * Roll a skill check.
	 * @param {SkillRollConfiguration} [config] - Configuration information for the roll.
	 * @param {BaseMessageConfiguration} [message] - Configuration data that guides roll message creation.
	 * @param {BaseDialogConfiguration} [dialog] - Presentation data for the roll configuration dialog.
	 * @returns {Promise<ChallengeRoll[]|void>}
	 */
	async rollSkill(config={}, message={}, dialog={}) {
		const skill = this.system.skills[config.skill];

		const prepareSkillConfig = (baseConfig={}, formData={}) => {
			const abilityId = formData.ability ?? baseConfig.ability ?? skill.ability;
			const ability = this.system.abilities[abilityId];

			const { parts, data } = buildRoll({
				mod: ability?.mod,
				prof: skill.proficiency.hasProficiency ? skill.proficiency.term : null,
				[`${abilityId}CheckBonus`]: ability?.bonuses.check,
				globalCheckBonus: this.system.bonuses?.ability?.check,
				bonus: skill.bonuses.check,
				globalSkillBonus: this.system.bonuses?.skill?.check
			}, this.getRollData());
			data.abilityId = abilityId;

			const rollConfig = foundry.utils.mergeObject(baseConfig, {
				data,
				options: {
					minimum: buildMinimum([
						skill.minimum, ability?.minimums.check,
						this.system.overrides?.skill?.minimum, this.system.overrides?.ability?.minimums.check
					], data)
				}
			});
			rollConfig.parts = parts.concat(config.parts ?? []);

			return rollConfig;
		};

		const rollConfig = prepareSkillConfig();

		const type = game.i18n.format("EH.Skill.Action.CheckSpecific", {
			skill: CONFIG.EverydayHeroes.skills[config.skill].label
		});
		const flavor = game.i18n.format("EH.Action.Roll", { type });
		const messageConfig = foundry.utils.mergeObject({
			data: {
				title: `${flavor}: ${this.name}`,
				flavor,
				speaker: ChatMessage.getSpeaker({actor: this}),
				"flags.everyday-heroes.roll": {
					type: "skill",
					skill: config.skill
				}
			}
		}, message);

		const dialogConfig = foundry.utils.mergeObject({
			buildConfig: prepareSkillConfig,
			options: {
				chooseAbility: true,
				title: game.i18n.format("EH.Roll.Configuration.LabelSpecific", { type })
			}
		}, dialog);

		/**
		 * A hook event that fires before an skill check is rolled for an Actor.
		 * @function everydayHeroes.preRollSkill
		 * @memberof hookEvents
		 * @param {ActorEH} actor - Actor for which the skill check is being rolled.
		 * @param {ChallengeRollConfiguration} config - Configuration data for the pending roll.
		 * @param {BaseMessageConfiguration} message - Configuration data for the roll's message.
		 * @param {BaseDialogConfiguration} dialog - Presentation data for the roll configuration dialog.
		 * @returns {boolean} - Explicitly return `false` to prevent skill check from being rolled.
		 */
		if ( Hooks.call("everydayHeroes.preRollSkill", this, rollConfig, messageConfig, dialogConfig) === false ) return;

		const rolls = await CONFIG.Dice.ChallengeRoll.build(rollConfig, messageConfig, dialogConfig);

		/**
		 * A hook event that fires after a skill check has been rolled for an Actor.
		 * @function everydayHeroes.rollSkill
		 * @memberof hookEvents
		 * @param {ActorEH} actor - Actor for which the skill check has been rolled.
		 * @param {ChallengeRoll} rolls - The resulting rolls.
		 * @param {string} skill - ID of the skill that was rolled as defined in `CONFIG.EverydayHeroes.skills`.
		 */
		if ( rolls?.length ) Hooks.callAll("everydayHeroes.rollSkill", this, rolls, config.skill);

		return rolls;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Actor Modification                       */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async modifyTokenAttribute(attribute, value, isDelta, isBar) {
		if ( attribute === "attributes.hp" ) {
			const hp = this.system.attributes.hp;
			const delta = isDelta ? (-1 * value) : (hp.value + hp.temp) - value;
			return this.applyDamage([{ value: delta }], { ignoreImmunity: true, ignoreReduction: true });
		}
		return super.modifyTokenAttribute(attribute, value, isDelta, isBar);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Description of a source of damage.
	 *
	 * @typedef {object} DamageDescription
	 * @property {number} value - Amount of damage.
	 * @property {string} type - Type of damage.
	 * @property {ActorEH|ItemEH} [source] - Source of the damage.
	 */

	/**
	 * Apply damage to the actor.
	 * @param {DamageDescription[]} damage - Damage descriptions to apply.
	 * @param {object} [options={}]
	 * @param {number} [options.multiplier=1] - Amount by which to multiply all damage (before damage reduction).
	 * @param {boolean} [options.ignoreImmunity=false] - Should this actor's damage immunity be ignored?
	 * @param {boolean} [options.ignoreReduction=false] - Should this actor's damage reduction be ignored?
	 * @returns {Promise<ActorEH>} - The actor after the update has been performed.
	 */
	async applyDamage(damage, options={}) {
		const hp = this.system.attributes.hp;
		if ( !hp ) return;
		const rollData = this.getRollData({deterministic: true});
		let inverted = false;
		let multiplier = options.multiplier ?? 1;

		if ( multiplier < 0 ) {
			inverted = true;
			multiplier *= -1;
		}

		let amount = damage.reduce((total, d) => {
			// Ignore damage types with immunity
			if ( !options.ignoreImmunity && this.system.traits?.damage?.immunity?.has(d.type) ) return total;

			// Apply damage multiplier
			let value = d.value * multiplier;

			// Apply type-specific damage reduction, ensuring damage reduction doesn't cause healing by accident
			if ( !options.ignoreReduction ) {
				const reduction = simplifyBonus(this.system.traits?.damage?.reduction?.[d.type], rollData);
				if ( Math.sign(value) !== Math.sign(value - reduction) ) value = 0;
				else value -= reduction;
			}

			return total + value;
		}, 0);

		// Apply overall damage reduction
		if ( !options.ignoreReduction ) {
			const reduction = simplifyBonus(this.system.traits?.damage?.reduction?.all, rollData);
			if ( Math.sign(amount) !== Math.sign(amount - reduction) ) amount = 0;
			else amount -= reduction;
		}

		// Round damage down
		amount = Math.floor(amount);

		// Invert damage if multiplier is negative
		if ( inverted ) amount *= -1;

		// Subtract from temp HP first & then from normal HP
		const deltaTemp = amount > 0 ? Math.min(hp.temp, amount) : 0;
		const deltaHP = Math.clamped(amount - deltaTemp, -(hp.damage ?? Infinity), hp.value);
		const updates = {
			"system.attributes.hp.temp": hp.temp - deltaTemp,
			"system.attributes.hp.value": hp.value - deltaHP
		};
		amount = deltaTemp + deltaHP;

		// TODO: Add apply damage hook here

		// Call core's hook so anything watching token bar changes can respond
		if ( Hooks.call("modifyTokenAttribute", {
			attribute: "attributes.hp", value: amount, isDelta: false, isBar: true
		}, updates) === false ) return false;

		return this.update(updates, { deltaHP: -amount });
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Apply temp HP to the actor, but only if it's more than the actor's current temp HP.
	 * @param {number} amount - Amount of temp HP to apply.
	 * @returns {Promise<ActorEH>} - The actor after the update has been performed.
	 */
	async applyTempHP(amount=0) {
		const current = this.system.attributes.hp.temp;
		return amount > current ? this.update({"system.attributes.hp.temp": amount}) : this;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Socket Event Handlers                    */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async _preCreate(data, options, userId) {
		await super._preCreate(data, options, userId);
		await this.system._preCreate?.(data, options, userId);

		if ( !data.img || data.img === this.constructor.DEFAULT_ICON ) {
			const img = this.system.constructor.metadata.image;
			if ( img ) this.updateSource({img});
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async _preUpdate(changed, options, userId) {
		await super._preUpdate(changed, options, userId);
		await this.system._preUpdate?.(changed, options, userId);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async _preDelete(options, userId) {
		await super._preDelete(options, userId);
		await this.system._preUpdate?.(options, userId);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_onCreate(data, options, userId) {
		super._onCreate(data, options, userId);
		this.system._onCreate?.(data, options, userId);
		if ( userId !== game.user.id ) return;

		// Ensure abilities & skills have their default values populated
		// TODO: This would be better handled by MappingField, but I'm not sure the best way to go about that
		const updates = {};
		if ( foundry.utils.isEmpty(this.system._source.abilities) ) updates["system.abilities"] = this.system.abilities;
		if ( foundry.utils.isEmpty(this.system._source.abilities) ) updates["system.skills"] = this.system.skills;
		if ( !foundry.utils.isEmpty(updates) ) this.update(updates);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_onUpdate(changed, options, userId) {
		super._onUpdate(changed, options, userId);
		this.system._onUpdate?.(changed, options, userId);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_onDelete(options, userId) {
		super._onDelete(options, userId);
		this.system._onDelete?.(options, userId);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Importing and Exporting                  */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static async createDialog(data={}, {parent=null, pack=null, ...options}={}) {

		// Collect data
		const documentName = this.metadata.name;
		const types = game.documentTypes[documentName].filter(t => t !== CONST.BASE_DOCUMENT_TYPE);
		const folders = parent ? [] : game.folders.filter(f => (f.type === documentName) && f.displayed);
		const label = game.i18n.localize(this.metadata.label);
		const title = game.i18n.format("DOCUMENT.Create", {type: label});

		// Render the document creation form
		const html = await renderTemplate("templates/sidebar/document-create.html", {
			folders,
			name: data.name || game.i18n.format("DOCUMENT.New", {type: label}),
			folder: data.folder,
			hasFolders: folders.length >= 1,
			type: data.type ?? game.settings.get("everyday-heroes", "_lastCreateTypeActor")
				?? CONFIG[documentName]?.defaultType ?? types[0],
			types: types.reduce((obj, t) => {
				const label = CONFIG[documentName]?.typeLabels?.[t] ?? t;
				obj[t] = game.i18n.has(label) ? game.i18n.localize(label) : t;
				return obj;
			}, {}),
			hasTypes: types.length > 1
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
				game.settings.set("everyday-heroes", "_lastCreateTypeActor", data.type);
				return this.create(data, {parent, pack, renderSheet: true});
			},
			rejectClose: false,
			options
		});
	}
}
