/**
 * Extended version of `Actor` class to support Everyday Heroes features.
 */
export default class ActorEH extends Actor {

	prepareBaseData() {
		this.system.prepareBaseData?.();
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedData() {
		this.system.prepareDerivedData?.();
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Rolling                                  */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async rollAbilityCheck(key, options={}) {
		console.log("rollAbilityCheck");
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async rollAbilitySave(key, options={}) {
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

		const rollData = foundry.utils.mergeObject({
			data
		}, options);
		rollData.parts = parts.concat(options.parts ?? []);

		if ( Hooks.call("everydayHeroes.preRollAbilitySave", this, rollData, key) === false ) return;

		const roll = await CONFIG.Dice.ChallengeRoll.build(rollData);

		if ( roll ) Hooks.callAll("everydayHeroes.rollAbilitySave", this, roll, key);

		return roll;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async rollDeathSave(options={}) {
		const death = this.system.attributes.death;
		const parts = [];
		const data = this.getRollData();

		// Death save bonus
		// Global save bonus

		const rollData = foundry.utils.mergeObject({
			data,
			options: { criticalSuccess: 2 }
		}, options);
		rollData.parts = parts.concat(options.parts ?? []);

		if ( Hooks.call("everydayHeroes.preRollDeathSave", this, rollData) === false ) return;

		const roll = await CONFIG.Dice.ChallengeRoll.build(rollData);
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
				details.chatString = "EverydayHeroes.DeathSave.CriticalSuccess";
			}

			// Three successes, you're stabilized
			else if ( successes >= CONFIG.EverydayHeroes.deathSave.successThreshold ) {
				details.updates = {
					"system.attributes.death.status": "stable",
					"system.attributes.death.success": 0,
					"system.attributes.death.failure": 0
				};
				details.chatString = "EverydayHeroes.DeathSave.Success";
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
			if ( failures >= 3 ) {
				details.updates["system.attributes.death.status"] = "dead";
				details.chatString = "EverydayHeroes.DeathSave.Failure";
			}
		}
		console.log(roll, roll.isCriticalSuccess, roll.isCriticalFailure, details);

		if ( Hooks.call("everydayHeroes.rollDeathSave", this, roll, details) === false ) return roll;

		if ( !foundry.utils.isEmpty(details.updates) ) await this.update(details.updates);

		// Display success/failure message

		return roll;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async rollHitDie(options={}) {
		console.log("rollHitDie");
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async rollSkill(key, options={}) {
		const skill = this.system.skills[key];
		const ability = this.system.abilities[options.ability ?? skill.ability];
		const parts = [];
		const data = this.getRollData();

		// Ability Modifier
		if ( ability ) {
			parts.push("@mod");
			data.mod = ability.mod;
			data.defaultAbility = options.ability ?? skill.ability;
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

		const rollData = foundry.utils.mergeObject({
			data
		}, options);
		rollData.parts = parts.concat(options.parts ?? []);

		if ( Hooks.call("everydayHeroes.preRollSkill", this, rollData, key) === false ) return;

		const roll = await CONFIG.Dice.ChallengeRoll.build(rollData);

		if ( roll ) Hooks.callAll("everydayHeroes.rollSkill", this, roll, key);

		return roll;
	}

}
