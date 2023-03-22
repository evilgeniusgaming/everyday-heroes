import RestDialog from "../applications/actor/rest-dialog.mjs";
import AdvancementConfirmationDialog from "../applications/advancement/advancement-confirmation-dialog.mjs";
import AdvancementManager from "../applications/advancement/advancement-manager.mjs";
import { buildRoll } from "../dice/utils.mjs";
import { simplifyBonus } from "../utils.mjs";
import Proficiency from "./proficiency.mjs";

/**
 * Extended version of `Actor` class to support Everyday Heroes features.
 */
export default class ActorEH extends Actor {

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareData() {
		super.prepareData();
		this.items.forEach(i => i.system.prepareFinalData?.());
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareBaseData() {
		this.system.prepareBaseData?.();
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedData() {
		this.system.prepareDerivedData?.();
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * @inheritdoc
	 * @param {object} [options]
	 * @param {boolean} [options.deterministic] - Whether to force deterministic values for data properties that could be
	 *                                            either a die term or a flat term.
	 */
	getRollData({ deterministic=false }={}) {
		const data = { ...super.getRollData() };
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
		const maxRecovered = Math.max(Math.floor(hd.max / 2), 1);
		const final = Math.clamped(0, hd.spent - maxRecovered, hd.max);
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
	 * @internal
	 */
	async _displayRestResultMessage(result) {
		console.log(result);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Rolling                                  */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Roll an ability check.
	 * @param {string} key - The ability ID as defined in `CONFIG.EverydayHeroes.abilities`.
	 * @param {ChallengeRollConfiguration} [config] - Configuration information for the roll.
	 * @param {BaseMessageConfiguration} [message] - Configuration data that guides roll message creation.
	 * @returns {Promise<ChallengeRoll|void>}
	 */
	async rollAbilityCheck(key, config={}, message={}) {
		const ability = this.system.abilities[key];
		if ( !ability ) return;

		const { parts, data } = buildRoll({
			mod: ability.mod,
			prof: ability.checkProficiency.hasProficiency ? ability.checkProficiency.term : null,
			bonus: ability.bonuses.check,
			globalBonus: this.system.bonuses?.ability?.check
		}, this.getRollData());

		const rollConfig = foundry.utils.mergeObject({ data }, config);
		rollConfig.parts = parts.concat(config.parts ?? []);

		const flavor = game.i18n.format("EH.Ability.Action.CheckSpecific", {
			ability: CONFIG.EverydayHeroes.abilities[key].label
		});
		const messageConfig = foundry.utils.mergeObject({
			data: {
				title: `${flavor}: ${this.name}`,
				flavor,
				speaker: ChatMessage.getSpeaker({actor: this}),
				"flags.everyday-heroes.roll": {
					type: "ability-check",
					key: key
				}
			}
		}, message);

		/**
		 * A hook event that fires before an ability check is rolled for an Actor.
		 * @function everydayHeroes.preRollAbilityCheck
		 * @memberof hookEvents
		 * @param {ActorEH} actor - Actor for which the ability check is being rolled.
		 * @param {ChallengeRollConfiguration} config - Configuration data for the pending roll.
		 * @param {BaseMessageConfiguration} message - Configuration data for the roll's message.
		 * @param {string} key - The ability ID as defined in `CONFIG.EverydayHeroes.abilities`.
		 * @returns {boolean} - Explicitly return `false` to prevent ability check from being rolled.
		 */
		if ( Hooks.call("everydayHeroes.preRollAbilityCheck", this, rollConfig, messageConfig, key) === false ) return;

		const roll = await CONFIG.Dice.ChallengeRoll.build(rollConfig, messageConfig);

		/**
		 * A hook event that fires after an ability check has been rolled for an Actor.
		 * @function everydayHeroes.rollAbilityCheck
		 * @memberof hookEvents
		 * @param {ActorEH} actor - Actor for which the ability check has been rolled.
		 * @param {D20Roll} roll - The resulting roll.
		 * @param {string} key - ID of the ability that was rolled as defined in `CONFIG.EverydayHeroes.abilities`.
		 */
		if ( roll ) Hooks.callAll("everydayHeroes.rollAbilityCheck", this, roll, key);

		return roll;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Roll an ability saving throw.
	 * @param {string} key - The ability ID as defined in `CONFIG.EverydayHeroes.abilities`.
	 * @param {ChallengeRollConfiguration} [config] - Configuration information for the roll.
	 * @param {BaseMessageConfiguration} [message] - Configuration data that guides roll message creation.
	 * @returns {Promise<ChallengeRoll|void>}
	 */
	async rollAbilitySave(key, config={}, message={}) {
		const ability = this.system.abilities[key];
		if ( !ability ) return;

		const { parts, data } = buildRoll({
			mod: ability.mod,
			prof: ability.saveProficiency.hasProficiency ? ability.saveProficiency.term : null,
			bonus: ability.bonuses.save,
			globalBonus: this.system.bonuses?.ability?.save
		}, this.getRollData());

		const rollConfig = foundry.utils.mergeObject({ data }, config);
		rollConfig.parts = parts.concat(config.parts ?? []);

		const flavor = game.i18n.format("EH.Ability.Action.SaveSpecific", {
			ability: CONFIG.EverydayHeroes.abilities[key].label
		});
		const messageConfig = foundry.utils.mergeObject({
			data: {
				title: `${flavor}: ${this.name}`,
				flavor,
				speaker: ChatMessage.getSpeaker({actor: this}),
				"flags.everyday-heroes.roll": {
					type: "ability-save",
					key: key
				}
			}
		}, message);

		/**
		 * A hook event that fires before an ability save is rolled for an Actor.
		 * @function everydayHeroes.preRollAbilitySave
		 * @memberof hookEvents
		 * @param {ActorEH} actor - Actor for which the ability save is being rolled.
		 * @param {ChallengeRollConfiguration} config - Configuration data for the pending roll.
		 * @param {BaseMessageConfiguration} message - Configuration data for the roll's message.
		 * @param {string} key - The ability ID as defined in `CONFIG.EverydayHeroes.abilities`.
		 * @returns {boolean} - Explicitly return `false` to prevent ability save from being rolled.
		 */
		if ( Hooks.call("everydayHeroes.preRollAbilitySave", this, rollConfig, messageConfig, key) === false ) return;

		const roll = await CONFIG.Dice.ChallengeRoll.build(rollConfig, messageConfig);

		/**
		 * A hook event that fires after an ability save has been rolled for an Actor.
		 * @function everydayHeroes.rollAbilitySave
		 * @memberof hookEvents
		 * @param {ActorEH} actor - Actor for which the ability save has been rolled.
		 * @param {D20Roll} roll - The resulting roll.
		 * @param {string} key - ID of the ability that was rolled as defined in `CONFIG.EverydayHeroes.abilities`.
		 */
		if ( roll ) Hooks.callAll("everydayHeroes.rollAbilitySave", this, roll, key);

		return roll;
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
	 * @returns {Promise<ChallengeRoll|void>}
	 */
	async rollDeathSave(config={}, message={}) {
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
				target: death.overrides.target ? death.overrides.target : undefined
			}
		}, config);
		rollConfig.parts = parts.concat(config.parts ?? []);

		const flavor = game.i18n.localize("EH.Death.Label[one]");
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

		/**
		 * A hook event that fires before an death save is rolled for an Actor.
		 * @function everydayHeroes.preRollDeathSave
		 * @memberof hookEvents
		 * @param {ActorEH} actor - Actor for which the death save is being rolled.
		 * @param {DeathSaveRollConfiguration} config - Configuration data for the pending roll.
		 * @param {BaseMessageConfiguration} message - Configuration data for the roll's message.
		 * @returns {boolean} - Explicitly return `false` to prevent death save from being rolled.
		 */
		if ( Hooks.call("everydayHeroes.preRollDeathSave", this, rollConfig, messageConfig) === false ) return;

		const roll = await CONFIG.Dice.ChallengeRoll.build(rollConfig, messageConfig);
		if ( !roll ) return;

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
		 * @param {D20Roll} roll - The resulting roll.
		 * @param {object} details
		 * @param {object} details.updates - Updates that will be applied to the actor as a result of this save.
		 * @param {string} details.chatString - Localizable string displayed in the create chat message. If not set,
		 *                                      then no chat message will be displayed.
		 * @param {number} details.count - Number of rolls succeeded or failed to result in this message.
		 * @returns {boolean} - Explicitly return `false` to prevent updates from being performed.
		 */
		if ( Hooks.call("everydayHeroes.rollDeathSave", this, roll, details) === false ) return roll;

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

		return roll;
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
	 * @param {HitDieRollConfiguration} config - Configuration information for the roll.
	 * @param {BaseMessageConfiguration} message - Configuration data that guides roll message creation.
	 * @returns {Promise<BaseRoll|void>}
	 */
	async rollHitDie(config={}, message={}) {
		const denomination = this.system.attributes.hd.denomination;
		if ( !denomination ) return console.warn("No hit die set up");
		if ( !this.system.attributes.hd.available ) return console.warn("No hit dice to spend");
		// TODO: Show UI warning message for both of these

		const num = config.advantage ? 2 : 1;
		const mod = config.advantage ? "kh" : "";
		const rollConfig = foundry.utils.mergeObject({
			fastForward: true,
			parts: [
				`max(0, ${num}d${denomination}${mod} + @abilities.${CONFIG.EverydayHeroes.defaultAbilities.hitPoints}.mod)`
			],
			// TODO: Format this so negative cons subtract, rather than add a negative
			data: this.getRollData()
		}, config);

		const flavor = game.i18n.format("EH.Action.Roll", {type: game.i18n.localize("EH.HitDice.Label[one]")});
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

		/**
		 * A hook event that fires before a hit die is rolled for an Actor.
		 * @function everydayHeroes.preRollHitDie
		 * @memberof hookEvents
		 * @param {ActorEH} actor - Actor for which the hit die is to be rolled.
		 * @param {HitDieRollConfiguration} config - Configuration data for the pending roll.
		 * @param {BaseMessageConfiguration} message - Configuration data for the roll's message.
		 * @param {number} denomination - Size of hit die to be rolled.
		 * @returns {boolean} - Explicitly return `false` to prevent hit die from being rolled.
		 */
		if ( Hooks.call("everydayHeroes.preRollHitDie", this, rollConfig, messageConfig, denomination) === false ) return;

		const roll = await CONFIG.Dice.BaseRoll.build(rollConfig, messageConfig, { configure: false });

		const updates = {};
		if ( rollConfig.modifySpentHitDie !== false ) {
			updates["system.attributes.hd.spent"] = this.system.attributes.hd.spent + 1;
		}
		if ( rollConfig.modifyHitPoints !== false ) {
			const hp = this.system.attributes.hp;
			updates["system.attributes.hp.value"] = Math.min(hp.max, hp.value + roll.total);
		}

		/**
		 * A hook event that fires after a hit die has been rolled for an Actor, but before updates have been performed.
		 * @function everydayHeroes.rollHitDie
		 * @memberof hookEvents
		 * @param {ActorEH} actor - Actor for which the hit die has been rolled.
		 * @param {Roll} roll - The resulting roll.
		 * @param {object} updates - Updates that will be applied to the actor.
		 * @returns {boolean} - Explicitly return `false` to prevent updates from being performed.
		 */
		if ( Hooks.call("everydayHeroes.rollHitDie", this, roll, updates) === false ) return roll;

		if ( !foundry.utils.isEmpty(updates) ) await this.update(updates);

		return roll;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Roll initiative.
	 * @param {object} [options] - Options for the initiative process (see Actor#rollInitiative).
	 * @param {boolean} [options.dialog=false] - Should the configuration dialog be shown?
	 * @param {ChallengeRollOptions} [rollOptions] - Additional options passed to the roll.
	 * @param {BaseMessageConfiguration} [message] - Configuration data that guides roll message creation.
	 * @returns {Promise<Combat|void>}
	 */
	async rollInitiative(options={}, rollOptions={}, message={}) {
		if ( options.dialog ) console.log("Configure initiative dialog");
		// TODO: Add hooks
		return super.rollInitiative(options);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Roll a luck saving throw.
	 * @param {ChallengeRollConfiguration} [config] - Configuration information for the roll.
	 * @param {BaseMessageConfiguration} [message] - Configuration data that guides roll message creation.
	 * @returns {Promise<ChallengeRoll|void>}
	 */
	async rollLuckSave(config={}, message={}) {
		const { parts, data } = buildRoll({
			globalBonus: this.system.bonuses?.ability?.save
		}, this.getRollData());

		const rollConfig = foundry.utils.mergeObject({
			data,
			options: {
				target: 11
			}
		}, config);
		rollConfig.parts = parts.concat(config.parts ?? []);

		const flavor = game.i18n.format("EH.Luck.Label");
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

		/**
		 * A hook event that fires before an luck save is rolled for an Actor.
		 * @function everydayHeroes.preRollLuckSave
		 * @memberof hookEvents
		 * @param {ActorEH} actor - Actor for which the luck save is being rolled.
		 * @param {ChallengeRollConfiguration} config - Configuration data for the pending roll.
		 * @param {BaseMessageConfiguration} message - Configuration data for the roll's message.
		 * @returns {boolean} - Explicitly return `false` to prevent ability save from being rolled.
		 */
		if ( Hooks.call("everydayHeroes.preRollLuckSave", this, rollConfig, messageConfig) === false ) return;

		const roll = await CONFIG.Dice.ChallengeRoll.build(rollConfig, messageConfig);

		/**
		 * A hook event that fires after an luck save has been rolled for an Actor.
		 * @function everydayHeroes.rollLuckSave
		 * @memberof hookEvents
		 * @param {ActorEH} actor - Actor for which the luck save has been rolled.
		 * @param {D20Roll} roll - The resulting roll.
		 */
		if ( roll ) Hooks.callAll("everydayHeroes.rollLuckSave", this, roll);

		return roll;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Roll a resource die (if resource has a die) and spend a use.
	 * @param {string} key - The resource ID as defined in `CONFIG.EverydayHeroes.resources`.
	 * @param {BaseRollConfiguration} [config] - Configuration information for the roll.
	 * @param {BaseMessageConfiguration} [message] - Configuration data that guides roll message creation.
	 * @returns {Promise<BaseRoll|void>}
	 */
	async rollResource(key, config={}, message={}) {
		const resource = this.system.resources[key];
		if ( !resource ) return console.warn(`Resource "${key}" not found`);
		if ( !resource.available ) return console.warn(`None of the resource "${resource.label}" is available to spend.`);

		const parts = resource.denomination ? [`1d${resource.denomination}`] : [];
		const data = this.getRollData();

		// TODO: Verify there is a enough remaining uses to spent this resource

		const rollConfig = foundry.utils.mergeObject({ data }, config);
		rollConfig.parts = parts.concat(config.parts ?? []);

		const flavor = "";
		// TODO: Add proper flavor
		const messageConfig = foundry.utils.mergeObject({
			data: {
				title: `${flavor}: ${this.name}`,
				flavor,
				speaker: ChatMessage.getSpeaker({actor: this}),
				"flags.everyday-heroes.roll": {
					type: "resource",
					key: key
				}
			}
		}, message);

		/**
		 * A hook event that fires before an resource is rolled for an Actor.
		 * @function everydayHeroes.preRollResource
		 * @memberof hookEvents
		 * @param {ActorEH} actor - Actor for which the resource is being rolled.
		 * @param {ChallengeRollConfiguration} config - Configuration data for the pending roll.
		 * @param {BaseMessageConfiguration} message - Configuration data for the roll's message.
		 * @param {string} key - The resource ID as defined in `CONFIG.EverydayHeroes.resources`.
		 * @returns {boolean} - Explicitly return `false` to prevent resource from being rolled.
		 */
		if ( Hooks.call("everydayHeroes.preRollResource", this, rollConfig, messageConfig, key) === false ) return;

		let roll;
		if ( rollConfig.parts.length ) roll = await CONFIG.Dice.BaseRoll.build(rollConfig, messageConfig);
		const updates = { [`system.resources.${key}.spent`]: resource.spent + 1 };

		/**
		 * A hook event that fires after a resource has been rolled for an Actor, but before the resource has been spent.
		 * @function everydayHeroes.rollResource
		 * @memberof hookEvents
		 * @param {ActorEH} actor - Actor for which the resource has been rolled.
		 * @param {D20Roll} [roll] - The resulting roll, if one was performed
		 * @param {string} key - ID of the resource that was rolled as defined in `CONFIG.EverydayHeroes.resources`.
		 * @param {object} updates - Updates that will be applied to the actor.
		 * @returns {boolean} - Explicitly return `false` to prevent any changes from being applied to the actor.
		 */
		if ( Hooks.call("everydayHeroes.rollResource", this, roll, key, updates) === false ) return roll;

		if ( !foundry.utils.isEmpty(updates) ) this.update(updates);

		return roll;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Roll a skill check.
	 * @param {string} key - The skill ID as defined in `CONFIG.EverydayHeroes.skills`.
	 * @param {ChallengeRollConfiguration} [config] - Configuration information for the roll.
	 * @param {BaseMessageConfiguration} [message] - Configuration data that guides roll message creation.
	 * @returns {Promise<ChallengeRoll|void>}
	 */
	async rollSkill(key, config={}, message={}) {
		const skill = this.system.skills[key];
		const ability = this.system.abilities[config.ability ?? skill.ability];
		const defaultAbility = config.ability ?? skill.ability;

		const { parts, data } = buildRoll({
			mod: ability?.mod,
			prof: skill.proficiency.hasProficiency ? skill.proficiency.term : null,
			[`${defaultAbility}CheckBonus`]: ability?.bonuses.check,
			globalCheckBonus: this.system.bonuses?.ability?.check,
			bonus: skill.bonuses.check,
			globalSkillBonus: this.system.bonuses?.skill?.check
		}, this.getRollData());
		data.defaultAbility = defaultAbility;

		const rollConfig = foundry.utils.mergeObject({ data }, config);
		rollConfig.parts = parts.concat(config.parts ?? []);

		const flavor = game.i18n.format("EH.Skill.Action.CheckSpecific", {
			skill: CONFIG.EverydayHeroes.skills[key].label
		});
		const messageConfig = foundry.utils.mergeObject({
			data: {
				title: `${flavor}: ${this.name}`,
				flavor,
				speaker: ChatMessage.getSpeaker({actor: this}),
				"flags.everyday-heroes.roll": {
					type: "skill",
					key: key
				}
			}
		}, message);

		/**
		 * A hook event that fires before an skill check is rolled for an Actor.
		 * @function everydayHeroes.preRollSkill
		 * @memberof hookEvents
		 * @param {ActorEH} actor - Actor for which the skill check is being rolled.
		 * @param {ChallengeRollConfiguration} config - Configuration data for the pending roll.
		 * @param {BaseMessageConfiguration} message - Configuration data for the roll's message.
		 * @param {string} key - The skill ID as defined in `CONFIG.EverydayHeroes.skills`.
		 * @returns {boolean} - Explicitly return `false` to prevent skill check from being rolled.
		 */
		if ( Hooks.call("everydayHeroes.preRollSkill", this, rollConfig, messageConfig, key) === false ) return;

		const roll = await CONFIG.Dice.ChallengeRoll.build(rollConfig, messageConfig);

		/**
		 * A hook event that fires after a skill check has been rolled for an Actor.
		 * @function everydayHeroes.rollSkill
		 * @memberof hookEvents
		 * @param {ActorEH} actor - Actor for which the skill check has been rolled.
		 * @param {D20Roll} roll - The resulting roll.
		 * @param {string} key - ID of the skill that was rolled as defined in `CONFIG.EverydayHeroes.skills`.
		 */
		if ( roll ) Hooks.callAll("everydayHeroes.rollSkill", this, roll, key);

		return roll;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Actor Modification                       */
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

		// Total damage and apply multiplier
		let amount = damage.reduce((total, d) => total + d.value, 0);
		// TODO: Take damage immunity into account
		amount = Math.floor(amount * (options.multiplier ?? 1));

		// Apply damage reduction
		amount -= simplifyBonus(this.system.traits?.damage?.reduction?.all, this.getRollData({deterministic: true}));

		// Subtract from temp HP first & then from normal HP
		const deltaTemp = amount > 0 ? Math.min(hp.temp, amount) : 0;
		const deltaHP = Math.clamped(-hp.damage, amount - deltaTemp, hp.value);
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

	async _preUpdate(changed, options, user) {
		if ( this.type !== "hero" ) return;

		const changedHP = foundry.utils.getProperty(changed, "system.attributes.hp.value");
		if ( changedHP !== undefined ) {
			if ( (changedHP > 0) || (this.system.attributes.hp.max === 0) ) {
				foundry.utils.setProperty(changed, "system.attributes.death.status", "alive");
				foundry.utils.setProperty(changed, "system.attributes.death.success", 0);
				foundry.utils.setProperty(changed, "system.attributes.death.failure", 0);
			} else if ( this.system.attributes.death.status === "alive" ) {
				foundry.utils.setProperty(changed, "system.attributes.death.status", "dying");
			}
		}

		if ( options.isAdvancement ) return;
		const changedLevel = foundry.utils.getProperty(changed, "system.details.level");
		const delta = changedLevel - this.system.details.level;
		if ( changedLevel && delta ) {
			foundry.utils.setProperty(changed, "system.details.level", this.system.details.level);
			this.updateSource(changed);
			const manager = AdvancementManager.forLevelChange(this, delta);
			if ( manager.steps.length ) {
				if ( delta > 0 ) return manager.render(true);
				try {
					const shouldRemoveAdvancements = await AdvancementConfirmationDialog.forLevelDown(this);
					if ( shouldRemoveAdvancements ) return manager.render(true);
				} catch(err) { }
			}
		}
	}
}
