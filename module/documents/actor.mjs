/**
 * Extended version of `Actor` class to support Everyday Heroes features.
 */
export default class ActorEH extends Actor {

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareBaseData() {
		this.system.prepareBaseData?.();
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedData() {
		this.system.prepareDerivedData?.();

		// TODO: Remove these when archetypes properly processed
		this.system.attributes.hd.denomination = "d8";
		this.system.attributes.hp.max = 50;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Rolling                                  */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Roll an ability check.
	 * @param {string} key - The ability ID as defined in `CONFIG.EverydayHeroes.abilities`.
	 * @param {ChallengeRollConfiguration} [config] - Configuration information for the roll.
	 * @param {RollMessageConfiguration} [message] - Configuration data that guides roll message creation.
	 * @returns {Promise<ChallengeRoll|void>}
	 */
	async rollAbilityCheck(key, config={}, message={}) {
		const ability = this.system.abilities[key];
		if ( !ability ) return;
		const parts = [];
		const data = this.getRollData();

		parts.push("@mod");
		data.mod = ability.mod;

		if ( ability.checkProficiency.hasProficiency ) {
			parts.push("@prof");
			data.prof = ability.checkProficiency.term;
		}

		// Ability-specific check bonus
		// Global check bonus

		const rollConfig = foundry.utils.mergeObject({
			data
		}, config);
		rollConfig.parts = parts.concat(config.parts ?? []);

		const flavor = game.i18n.format("EH.Abilities.Action.CheckSpecific", {
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
		 * @param {RollMessageConfiguration} message - Configuration data for the roll's message.
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
	 * @param {RollMessageConfiguration} [message] - Configuration data that guides roll message creation.
	 * @returns {Promise<ChallengeRoll|void>}
	 */
	async rollAbilitySave(key, config={}, message={}) {
		const ability = this.system.abilities[key];
		if ( !ability ) return;
		const parts = [];
		const data = this.getRollData();

		parts.push("@mod");
		data.mod = ability.mod;

		if ( ability.saveProficiency.hasProficiency ) {
			parts.push("@prof");
			data.prof = ability.saveProficiency.term;
		}

		// Ability-specific save bonus
		// Global save bonus

		const rollConfig = foundry.utils.mergeObject({
			data
		}, config);
		rollConfig.parts = parts.concat(config.parts ?? []);

		const flavor = game.i18n.format("EH.Abilities.Action.SaveSpecific", {
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
		 * @param {RollMessageConfiguration} message - Configuration data for the roll's message.
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
	 * Roll a death saving throw.
	 * @param {ChallengeRollConfiguration} [config] - Configuration information for the roll.
	 * @param {RollMessageConfiguration} [message] - Configuration data that guides roll message creation.
	 * @returns {Promise<ChallengeRoll|void>}
	 */
	async rollDeathSave(config={}, message={}) {
		const death = this.system.attributes.death;
		const parts = [];
		const data = this.getRollData();

		// Death save bonus
		// Global save bonus

		const rollConfig = foundry.utils.mergeObject({
			data
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
		 * @param {ChallengeRollConfiguration} config - Configuration data for the pending roll.
		 * @param {RollMessageConfiguration} message - Configuration data for the roll's message.
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
			else if ( successes >= CONFIG.EverydayHeroes.deathSave.successThreshold ) {
				details.updates = {
					"system.attributes.death.status": "stable",
					"system.attributes.death.success": 0,
					"system.attributes.death.failure": 0
				};
				details.chatString = "EH.Death.Message.Success";
				details.count = CONFIG.EverydayHeroes.deathSave.successThreshold;
			}

			// Increment successes
			else details.updates = {
				"system.attributes.death.success": Math.clamped(successes, 0, CONFIG.EverydayHeroes.deathSave.successThreshold)
			};
		}

		// Save failure
		else {
			let failures = (death.failure || 0) + (roll.isCriticalFailure ? 2 : 1);
			details.updates = {
				"system.attributes.death.failure": Math.clamped(failures, 0, CONFIG.EverydayHeroes.deathSave.failureThreshold)
			};
			// Three failures, you're dead
			if ( failures >= CONFIG.EverydayHeroes.deathSave.failureThreshold ) {
				details.updates["system.attributes.death.status"] = "dead";
				details.chatString = "EH.Death.Message.Failure";
				details.count = CONFIG.EverydayHeroes.deathSave.failureThreshold;
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
	 * @property {boolean} [modifySpentHitDie=true] - Should the actor's spent hit die count be updated?
	 * @property {boolean} [modifyHitPoints=true] - Should the actor's hit points be updated after the roll?
	 */

	/**
	 * Roll one of the actor's hit die and add its value to their health.
	 * @param {HitDieRollConfiguration} config - Configuration information for the roll.
	 * @param {RollMessageConfiguration} message - Configuration data that guides roll message creation.
	 * @returns {Promise<BaseRoll|void>}
	 */
	async rollHitDie(config={}, message={}) {
		const denomination = this.system.attributes.hd.denomination;
		if ( !denomination ) return console.warn("No hit die set up");
		if ( !this.system.attributes.hd.available ) return console.warn("No hit dice to spend");
		// TODO: Show UI warning message for both of these

		const rollConfig = foundry.utils.mergeObject({
			fastForward: true,
			parts: [`max(0, 1${denomination} + @abilities.${CONFIG.EverydayHeroes.defaultAbilities.hitPoints}.mod)`],
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
		 * @param {RollMessageConfiguration} message - Configuration data for the roll's message.
		 * @param {string} denomination - Size of hit die to be rolled.
		 * @returns {boolean} - Explicitly return `false` to prevent hit die from being rolled.
		 */
		if ( Hooks.call("everydayHeroes.preRollHitDie", this, rollConfig, messageConfig, denomination) === false ) return;

		const roll = await CONFIG.Dice.BaseRoll.build(rollConfig, messageConfig);

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

		console.log(updates);
		if ( !foundry.utils.isEmpty(updates) ) await this.update(updates);

		return roll;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Roll a skill check.
	 * @param {string} key - The skill ID as defined in `CONFIG.DND5E.skills`.
	 * @param {ChallengeRollConfiguration} [config] - Configuration information for the roll.
	 * @param {RollMessageConfiguration} [message] - Configuration data that guides roll message creation.
	 * @returns {Promise<ChallengeRoll|void>}
	 */
	async rollSkill(key, config={}, message={}) {
		const skill = this.system.skills[key];
		const ability = this.system.abilities[config.ability ?? skill.ability];
		const parts = [];
		const data = this.getRollData();

		// Ability Modifier
		if ( ability ) {
			parts.push("@mod");
			data.mod = ability.mod;
			data.defaultAbility = config.ability ?? skill.ability;
		}

		// Proficiency
		if ( skill.proficiency.hasProficiency ) {
			parts.push("@prof");
			data.prof = skill.proficiency.term;
		}

		// Ability-specific check bonus
		// Global ability check bonus
		// Skill-specific bonus
		// Global skill check bonus

		const rollConfig = foundry.utils.mergeObject({
			data
		}, config);
		rollConfig.parts = parts.concat(config.parts ?? []);

		const flavor = game.i18n.format("EH.Skills.Action.CheckSpecific", {
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
		 * @param {RollMessageConfiguration} message - Configuration data for the roll's message.
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

}
