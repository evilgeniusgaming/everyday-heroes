import { buildRoll } from "../../dice/utils.mjs";
import { numberFormat, simplifyBonus } from "../../utils.mjs";
import SystemDataModel from "../abstract/system-data-model.mjs";
import FormulaField from "../fields/formula-field.mjs";
import MappingField from "../fields/mapping-field.mjs";

/**
 * Data for a vehicle ability.
 *
 * @typedef {object} VehicleAbilityData
 * @property {number} mod - Ability's modifier.
 * @property {object} bonuses
 * @property {string} bonuses.check - Bonus to checks with this ability.
 * @property {string} bonuses.save - Bonus to saves with this ability.
 */

/**
 * Data for people in the vehicle.
 *
 * @typedef {object} VehiclePersonData
 * @property {ActorEH} actor - A person in the vehicle.
 * @property {number} sort - Sorting value of the person.
 * @property {ItemEH} weapon - Weapon the person is currently crewing.
 */

/**
 * Data definition for Vehicle actors.
 *
 * @property {Object<string, VehicleAbilityData>} abilities
 * @property {object} attributes
 * @property {object} attributes.armor
 * @property {number} attributes.armor.value - Armor value of the vehicle's body.
 * @property {object} attributes.defense
 * @property {string} attributes.defense.bonus - Bonus added to the vehicle's defense.
 * @property {object} attributes.speed
 * @property {string} attributes.speed.category - Current speed category.
 * @property {number} attributes.speed.min - Minimum vehicle speed range.
 * @property {number} attributes.speed.max - Maximum vehicle speed.
 * @property {string} attributes.speed.units - Units in which the speed is measured.
 * @property {object} attributes.type
 * @property {string} attributes.type.value - Type of vehicle (land, air, water, space).
 * @property {string} attributes.type.category - Vehicle category (civilian, commercial, law enforcement, military).
 * @property {object} biography
 * @property {string} biography.value - Full vehicle biography.
 * @property {string} biography.public - Public-facing biography.
 * @property {string} biography.notes - Additional notes.
 * @property {object} bonuses
 * @property {object} bonuses.roll - Roll-specific bonuses.
 * @property {object} conditions - Conditions affecting this vehicle.
 * @property {object} details
 * @property {ActorEH} details.driver - Driver of the vehicle.
 * @property {object} details.passengers
 * @property {number} details.passengers.min - Minimum passenger range.
 * @property {number} details.passengers.max - Maximum number of passengers.
 * @property {number} details.price - Price value.
 * @property {object} items - Configuration data for embedded items.
 * @property {VehiclePersonData[]} people - All people currently in the vehicle.
 * @property {object} traits
 * @property {object} traits.properties - Properties of this vehicle.
 * @property {string} traits.size - Size of the vehicle.
 */
export default class VehicleData extends SystemDataModel {

	static metadata = {
		type: "vehicle",
		localization: "EH.Actor.Type.Vehicle",
		image: "systems/everyday-heroes/artwork/svg/actors/vehicle.svg"
	};

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			abilities: new MappingField(new foundry.data.fields.SchemaField({
				mod: new foundry.data.fields.NumberField({
					nullable: false, initial: 0, integer: true, label: "EH.Ability.Modifier"
				}),
				bonuses: new foundry.data.fields.SchemaField({
					check: new FormulaField({label: "EH.Ability.Bonus.Check"}),
					save: new FormulaField({label: "EH.Ability.Bonus.Save"})
				})
			}), {initialKeys: CONFIG.EverydayHeroes.vehicleAbilities, prepareKeys: true, label: "EH.Ability.Label[other]"}),
			attributes: new foundry.data.fields.SchemaField({
				armor: new foundry.data.fields.SchemaField({
					value: new foundry.data.fields.NumberField({
						initial: 0, min: 0, integer: true, label: "EH.Vehicle.Trait.ArmorValue.Body.Label"
					})
				}, {label: "EH.Equipment.Trait.ArmorValue.Label", hint: "EH.Vehicle.Trait.ArmorValue.Hint"}),
				defense: new foundry.data.fields.SchemaField({
					bonus: new FormulaField({deterministic: true, label: "EH.Defense.Bonus.Label"})
				}, {label: "EH.Defense.Label"}),
				speed: new foundry.data.fields.SchemaField({
					category: new foundry.data.fields.StringField({
						initial: "stopped", label: "EH.Vehicle.Trait.SpeedCategory.Label"
					}),
					min: new foundry.data.fields.NumberField({min: 0, integer: true, label: "EH.Range.Min"}),
					max: new foundry.data.fields.NumberField({min: 0, integer: true, label: "EH.Range.Max"}),
					units: new foundry.data.fields.StringField({initial: "miles-per-hour", label: "EH.Measurement.Units"})
				}, {label: "EH.Vehicle.Trait.TopSpeed.Label"}),
				type: new foundry.data.fields.SchemaField({
					value: new foundry.data.fields.StringField({label: "EH.Vehicle.Type.Label"}),
					category: new foundry.data.fields.StringField({label: "EH.Vehicle.Category.Label"})
				})
			}, {label: "EH.Attributes.Label"}),
			biography: new foundry.data.fields.SchemaField({
				value: new foundry.data.fields.HTMLField({label: "EH.Biography.Label"}),
				public: new foundry.data.fields.HTMLField({label: "EH.Biography.Public"}),
				notes: new foundry.data.fields.HTMLField({label: "EH.Biography.Notes"})
			}, {label: "EH.Biography.Label"}),
			bonuses: new foundry.data.fields.SchemaField({
				roll: new MappingField(new FormulaField(), {
					label: game.i18n.format("EH.Vehicle.Bonus.LabelSpecific[other]", {
						type: game.i18n.localize("EH.Dice.Action.Roll")
					})
				})
			}, {label: "EH.Bonus.Global.Label[other]"}),
			conditions: new MappingField(new foundry.data.fields.NumberField({
				min: 0, integer: true
			}), {label: "EH.Condition.Label[other]"}),
			details: new foundry.data.fields.SchemaField({
				driver: new foundry.data.fields.ForeignDocumentField(foundry.documents.BaseActor),
				passengers: new foundry.data.fields.SchemaField({
					min: new foundry.data.fields.NumberField({min: 0, integer: true, label: "EH.Range.Min"}),
					max: new foundry.data.fields.NumberField({min: 0, integer: true, label: "EH.Range.Max"})
				}, {label: "EH.Vehicle.Trait.Passengers.Label", hint: "EH.Vehicle.Trait.Passengers.Hint"}),
				price: new foundry.data.fields.NumberField({
					required: true, nullable: false, initial: 0, min: 0, integer: true,
					label: "EH.Equipment.Trait.PriceLevel.Label", hint: "EH.Equipment.Trait.PriceLevel.Hint"
				})
			}, {label: "EH.Details.Label"}),
			items: new MappingField(new foundry.data.fields.SchemaField({
				ammunition: new foundry.data.fields.ForeignDocumentField(foundry.documents.BaseItem, {idOnly: true, label: ""}),
				mounted: new foundry.data.fields.BooleanField({label: ""}),
				mode: new foundry.data.fields.StringField({label: ""})
			})),
			people: new foundry.data.fields.ArrayField(new foundry.data.fields.SchemaField({
				actor: new foundry.data.fields.ForeignDocumentField(foundry.documents.BaseActor, {label: ""}),
				sort: new foundry.data.fields.IntegerSortField(),
				weapon: new foundry.data.fields.ForeignDocumentField(foundry.documents.BaseItem, {idOnly: true, label: ""})
			})),
			traits: new foundry.data.fields.SchemaField({
				properties: new foundry.data.fields.SetField(new foundry.data.fields.StringField(), {
					label: "EH.Weapon.Property.Label"
				}),
				size: new foundry.data.fields.StringField({initial: "medium", label: "EH.Size.Label"})
			}, {label: "EH.Traits.Label"})
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * The skill object for a driver's Vehicles skill, or Athletics if the vehicle is muscle-powered.
	 * @type {SkillData|void}
	 */
	get driverSkill() {
		return this.details.driver?.system.skills?.[this.driverSkillKey];
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * The key for the driver's Vehicles skill, or Athletics if the vehicle is muscle-powered.
	 * @type {string}
	 */
	get driverSkillKey() {
		return this.traits.properties.has("musclePowered") ? "athl" : "vehi";
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get shouldPrepareFinalData() {
		return !this.details.driver;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareBaseArmorValue() {
		this.attributes.armor.windowsTires = 1;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareBasePeople() {
		this.people = new Collection(this.people.filter(p => p.actor).map(p => [p.actor.id, p]));
	}

	static migratePeople(source) {
		if ( foundry.utils.getType(source.people) !== "Object" ) return;
		source.people = Object.entries(source.people).map(([id, p]) => {
			p.actor = id;
			return p;
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedAbilities() {
		for ( const [key, ability] of Object.entries(this.abilities) ) {
			ability._source = this._source.abilities?.[key] ?? {};
			ability._baseMod = ability.mod;
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedArmorValue() {
		this.attributes.armor._baseWindowsTires = 1;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedPassengers() {
		const passengers = this.details.passengers;
		passengers.label = this._formatRange(passengers.min, passengers.max);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedProperties() {
		const properties = this.traits.properties;
		const formatter = new Intl.ListFormat(game.i18n.lang, { style: "short", type: "unit" });
		properties.label = formatter.format(properties.map(p => {
			const config = CONFIG.EverydayHeroes.vehicleProperties[p];
			return config ? `<span class="property-hint" data-tooltip="${config.hint}">${config.label}</span>` : null;
		}).filter(p => p));
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedSpeed() {
		const speed = this.attributes.speed;
		speed.label = this._formatRange(speed.min, speed.max, speed.units);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedType() {
		this.attributes.type.label = game.i18n.format("EH.Vehicle.Type.DetailedLabel", {
			size: CONFIG.EverydayHeroes.sizes[this.traits.size]?.label ?? "",
			category: CONFIG.EverydayHeroes.vehicleCategories[this.attributes.type.category]?.label ?? "",
			type: CONFIG.EverydayHeroes.vehicleTypes[this.attributes.type.value]?.label ?? ""
		}).trim().replace("  ", " ");
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareFinalAbilities() {
		if ( !this.details.driver ) return;
		const rollData = this.details.driver.getRollData({deterministic: true});
		for ( const [key, ability] of Object.entries(this.abilities) ) {
			const driverBonus = simplifyBonus(this.details.driver.system.vehicle?.bonuses.ability[key] ?? "", rollData);
			ability.mod = ability._baseMod + driverBonus;
			if ( key === "str" && this.traits.properties.has("musclePowered") ) {
				ability.mod += this.details.driver.system.abilities?.str?.mod ?? 0;
			}
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareFinalArmorValue() {
		const armor = this.attributes.armor;
		if ( this.traits.properties.has("bulletproof") ) armor.windowsTires = armor._baseWindowsTires + 2;
		armor.label = `${numberFormat(armor.value)} (${game.i18n.format(
			"EH.Vehicle.Trait.ArmorValue.WindowsTires.LabelSpecific", { number: numberFormat(armor.windowsTires) }
		)})`;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareFinalDefense() {
		const rollData = this.parent.getRollData({deterministic: true});
		const bonus = simplifyBonus(this.attributes.defense.bonus, rollData);
		if ( this.attributes.speed.category === "stopped" || ((this.driverSkill?.proficiency.multiplier ?? 0) < 1 ) ) {
			this.attributes.defense.value = 5 + bonus;
		} else {
			const value = Math.min(this.abilities.dex?.mod ?? Infinity, this.driverSkill?.mod ?? Infinity);
			this.attributes.defense.value = 10 + (Number.isFinite(value) ? value : 0);
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Helpers                                  */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Add the provided actor to the vehicle.
	 * @param {ActorEH} actor - Actor to add.
	 * @param {object} [options={}]
	 * @param {boolean} [options.driver=false] - Should this actor be set as the driver?
	 */
	async addPerson(actor, { driver=false }={}) {
		if ( actor.system.constructor.metadata.category !== "person" ) {
			throw new Error(game.i18n.localize("EH.Vehicle.Error.OnlyPeople"));
		}
		if ( actor.pack || this.parent.pack ) throw new Error(game.i18n.localize("EH.Vehicle.Error.NoPacks"));
		if ( this.people.get(actor.id) ) return;

		// Ensure the person isn't already in another vehicle
		const otherVehicle = actor.system.vehicle?.actor;
		if ( otherVehicle && otherVehicle !== this.parent ) {
			try {
				await new Promise((resolve, reject) => {
					new Dialog({
						title: game.i18n.localize("EH.Vehicle.Prompt.Title"),
						content: game.i18n.format("EH.Vehicle.Prompt.Message", { this: this.parent.name, other: otherVehicle.name }),
						focus: true,
						default: "move",
						buttons: {
							move: {
								icon: "",
								label: game.i18n.format("EH.Vehicle.Prompt.Move", { vehicle: this.parent.name }),
								callback: resolve
							},
							stay: {
								icon: "",
								label: game.i18n.format("EH.Vehicle.Prompt.Stay", { vehicle: otherVehicle.name }),
								callback: reject
							}
						},
						close: reject
					}).render(true);
				});
			} catch(err) {
				return;
			}
			await otherVehicle.system.removePerson(actor);
		}

		// Ensure the vehicle isn't full
		if ( this.details.passengers.max ) {
			const peopleCount = this.people.size;
			if ( peopleCount >= this.details.passengers.max ) {
				const pluralRule = new Intl.PluralRules(game.i18n.lang);
				throw new Error(game.i18n.format("EH.Vehicle.Error.NoSpace", {
					number: numberFormat(this.details.passengers.max), people: game.i18n.localize(
						`EH.Vehicle.People.Label[${pluralRule.select(this.details.passengers.max)}]`
					).toLowerCase()
				}));
			}
		}

		const sort = this.people.contents
			.reduce((sort, p) => p.sort > sort ? p.sort : sort, 0) + CONST.SORT_INTEGER_DENSITY;
		const peopleCollection = this.toObject().people;
		peopleCollection.push({ actor: actor.id, sort });
		const updates = { "system.people": peopleCollection };
		if ( driver ) updates["system.details.driver"] = actor.id;
		await this.parent.update(updates);
		await actor.update({"system.vehicle.actor": this.parent.id});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Remove a person from the vehicle.
	 * @param {ActorEH} actor - Actor to remove.
	 */
	async removePerson(actor) {
		if ( !this.people.get(actor.id) ) throw new Error(`Actor ${actor.name} not found in the vehicle.`);
		const peopleCollection = this.toObject().people;
		peopleCollection.findSplice(p => p.actor === actor.id);
		const updates = { "system.people": peopleCollection };
		if ( this.details.driver === actor ) updates["system.details.driver"] = null;
		await this.parent.update(updates);
		if ( actor.system.vehicle?.actor === this.parent ) await actor.update({"system.vehicle.actor": null});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Format a passenger or speed range.
	 * @param {number} [min] - Minimum value.
	 * @param {number} [max] - Maximum value.
	 * @param {string} [unit] - Optional units.
	 * @returns {string}
	 * @internal
	 */
	_formatRange(min, max, unit) {
		const options = unit ? { unit } : undefined;
		if ( !min && !max ) return "";
		if ( !max ) return `${numberFormat(min, options)}+`; // Only Min (3+)
		else if ( !min || (min === max) ) return numberFormat(max, options); // Only Max, same Min & Max (3)
		else return `${numberFormat(min)}–${numberFormat(max, options)}`; // Different Min & Max (3–5)
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
			case "vehicle-check":
				return this.rollCheck(config, message, dialog);
			case "vehicle-damage":
				return this.rollDamage(config, message, dialog);
			case "vehicle-save":
				return this.rollSave(config, message, dialog);
			default:
				return console.warn(`Everyday Heroes | Invalid roll type clicked ${type}.`);
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Configuration information for an vehicle check.
	 *
	 * @typedef {ChallengeRollConfiguration} VehicleCheckRollConfiguration
	 * @property {string} key - Type of vehicle roll to perform as defined in `CONFIG.EverydayHeroes.vehicleRolls`.
	 * @property {string} [skill] - The driver's skill to use when rolling rather than the default.
	 */

	/**
	 * Roll a vehicle check.
	 * @param {VehicleCheckRollConfiguration} [config] - Configuration information for the roll.
	 * @param {BaseMessageConfiguration} [message] - Configuration data that guides roll message creation.
	 * @param {BaseDialogConfiguration} [dialog] - Presentation data for the roll configuration dialog.
	 * @returns {Promise<ChallengeRoll[]|void>}
	 */
	async rollCheck(config={}, message={}, dialog={}) {
		const defaultConfig = CONFIG.EverydayHeroes.vehicleRolls[config.key];
		if ( !defaultConfig ) return console.warn(`Vehicle roll type ${config.type} not found.`);

		const abilityKey = defaultConfig.ability;
		const ability = this.abilities[abilityKey] ?? {};
		const skill = this.driverSkill ?? {};

		const { parts, data } = buildRoll({
			mod: Math.min(skill.mod ?? 0, defaultConfig.mode === "max" ? (ability.mod ?? 0) : Infinity),
			[abilityKey]: defaultConfig.mode === "add" ? (ability.mod ?? 0) : null,
			[`${abilityKey}Bonus`]: ability.bonuses?.check,
			driverBonus: this.details.driver?.system.vehicle?.bonuses.roll[config.key],
			vehicleBonus: this.bonuses.roll[config.key]
		}, this.parent.getRollData());

		const rollConfig = foundry.utils.mergeObject({
			data
		}, config);
		rollConfig.parts = parts.concat(config.parts ?? []);

		const type = game.i18n.localize(defaultConfig.label);
		const flavor = game.i18n.format("EH.Action.Roll", { type });
		const messageConfig = foundry.utils.mergeObject({
			data: {
				title: `${flavor}: ${this.parent.name}`,
				flavor,
				speaker: ChatMessage.getSpeaker({actor: this.parent}),
				"flags.everyday-heroes.roll": {
					type: "vehicle",
					key: config.key,
					ability: abilityKey,
					skill: this.driverSkillKey
				}
			}
		}, message);

		const dialogConfig = foundry.utils.mergeObject({
			options: {
				title: game.i18n.format("EH.Roll.Configuration.LabelSpecific", { type })
			}
		}, dialog);

		/**
		 * A hook event that fires before an vehicle check is rolled for an Actor.
		 * @function everydayHeroes.preRollVehicleCheck
		 * @memberof hookEvents
		 * @param {ActorEH} actor - Actor for which the vehicle check is being rolled.
		 * @param {VehicleCheckRollConfiguration} config - Configuration data for the pending roll.
		 * @param {BaseMessageConfiguration} message - Configuration data for the roll's message.
		 * @param {BaseDialogConfiguration} dialog - Presentation data for the roll configuration dialog.
		 * @returns {boolean} - Explicitly return `false` to prevent vehicle check from being rolled.
		 */
		if ( Hooks.call("everydayHeroes.preRollVehicleCheck", this.parent,
			rollConfig, messageConfig, dialogConfig) === false ) return;

		const rolls = await CONFIG.Dice.ChallengeRoll.build(rollConfig, messageConfig, dialogConfig);

		/**
		 * A hook event that fires after an vehicle check has been rolled for an Actor.
		 * @function everydayHeroes.rollVehicleCheck
		 * @memberof hookEvents
		 * @param {ActorEH} actor - Actor for which the vehicle check has been rolled.
		 * @param {ChallengeRoll[]} rolls - The resulting rolls.
		 * @param {string} key - Type of vehicle check rolled as defined in `CONFIG.EverydayHeroes.vehicleRolls`.
		 */
		if ( rolls?.length ) Hooks.callAll("everydayHeroes.rollVehicleCheck", this.parent, rolls, config.key);

		return rolls;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Roll vehicle or passenger damage.
	 * @param {DamageRollConfiguration} [config] - Configuration information for the roll.
	 * @param {BaseMessageConfiguration} [message] - Configuration data that guides roll message creation.
	 * @param {BaseDialogConfiguration} [dialog] - Presentation data for the roll configuration dialog.
	 * @returns {Promise<ChallengeRoll[]|ChatMessage|void>}
	 */
	async rollDamage(config={}, message={}, dialog={}) {
		const defaultConfig = CONFIG.EverydayHeroes.vehicleRolls[config.key];
		if ( !defaultConfig ) return console.warn(`Vehicle roll type ${config.type} not found.`);

		const speedCategory = CONFIG.EverydayHeroes.vehicleSpeedCategories[this.attributes.speed.category];
		const damageFormula = speedCategory?.damage?.[defaultConfig.mode];
		if ( !damageFormula ) return;

		// Not valid formula, just display in roll message as text
		if ( !Roll.validate(damageFormula) ) {
			const text = game.i18n.localize(speedCategory.damage[`${defaultConfig.mode}Hint`] ?? damageFormula);
			const messageConfig = foundry.utils.mergeObject({
				data: {
					title: `${defaultConfig.label}: ${this.parent.name}`,
					flavor: defaultConfig.label,
					content: text,
					speaker: ChatMessage.getSpeaker({actor: this.parent}),
					"flags.everyday-heroes.roll": {
						type: "damage",
						origin: this.parent.uuid
					}
				}
			}, message);

			if ( message.create === false ) return;
			ChatMessage.applyRollMode(messageConfig.data, game.settings.get("core", "rollMode"));
			return ChatMessage.create(messageConfig.data);
		}

		let pv;
		if ( defaultConfig.mode === "passenger" ) pv = null;
		else if ( speedCategory.pv !== undefined ) pv = numberFormat(speedCategory.pv, { sign: true });

		const rollConfig = foundry.utils.mergeObject({
			data: this.parent.getRollData(),
			options: {
				allowCritical: false,
				type: "bludgeoning",
				pv
			}
		}, config);
		rollConfig.parts = [damageFormula].concat(config.parts ?? []);

		const messageConfig = foundry.utils.mergeObject({
			preCreate: (rolls, messageConfig) => {
				const isVehicle = defaultConfig.mode === "vehicle";
				const dc = isVehicle ? Math.floor(rolls[0].total / 2) : 15;
				messageConfig.data["flags.everyday-heroes.actions"] ??= [];
				messageConfig.data["flags.everyday-heroes.actions"].push({
					label: game.i18n.format("EH.ChallengeRating.Action", {
						dc, action: game.i18n.format("EH.Ability.Action.SaveSpecificShort", {
							ability: CONFIG.EverydayHeroes.abilities.con?.label ?? ""
						})
					}),
					results: {
						success: {
							label: game.i18n.localize("EH.Roll.Result.Success"),
							summary: game.i18n.localize(`EH.Damage.Effect.${isVehicle ? "Vehicle.Rolled" : "Half"}`)
							// TODO: Automatically roll on damage table on success
						},
						failure: {
							label: game.i18n.localize("EH.Roll.Result.Failure"),
							summary: game.i18n.localize(`EH.Damage.Effect.${isVehicle ? "Vehicle.Totaled" : "Full"}`)
							// TODO: Automatically set condition to "Totaled" on failure
						}
					},
					type: isVehicle ? "vehicle-save" : "ability-save",
					dataset: { ability: "con", options: { target: dc } }
				});
			},
			data: {
				title: `${defaultConfig.label}: ${this.parent.name}`,
				flavor: defaultConfig.label,
				speaker: ChatMessage.getSpeaker({actor: this.parent}),
				"flags.everyday-heroes.roll": {
					type: "damage",
					origin: this.parent.uuid
				}
			}
		}, message);

		const dialogConfig = foundry.utils.mergeObject({
			options: {
				title: game.i18n.format("EH.Roll.Configuration.LabelSpecific", { type: defaultConfig.label })
			}
		}, dialog);

		/**
		 * A hook event that fires before a damage is rolled for a vehicle.
		 * @function everydayHeroes.preRollVehicleDamage
		 * @memberof hookEvents
		 * @param {ActorEH} actor - Vehicle for which the roll is being performed.
		 * @param {DamageRollConfiguration} config - Configuration data for the pending roll.
		 * @param {BaseMessageConfiguration} message - Configuration data for the roll's message.
		 * @param {BaseDialogConfiguration} dialog - Presentation data for the roll configuration dialog.
		 * @returns {boolean} - Explicitly return false to prevent the roll from being performed.
		 */
		if ( Hooks.call("everydayHeroes.preRollVehicleDamage", this.parent, rollConfig,
			messageConfig, dialogConfig) === false ) return;

		const rolls = await CONFIG.Dice.DamageRoll.build(rollConfig, messageConfig, dialogConfig);
		if ( !rolls ) return;

		/**
		 * A hook event that fires after a damage has been rolled for a vehicle.
		 * @function everydayHeroes.rollVehicleDamage
		 * @memberof hookEvents
		 * @param {ActorEH} actor - Vehicle for which the roll was performed.
		 * @param {DamageRoll[]} rolls - The resulting rolls.
		 */
		Hooks.callAll("everydayHeroes.rollVehicleDamage", this.parent, rolls);

		return rolls;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Roll a vehicle's saving throw.
	 * @param {ChallengeRollConfiguration} [config] - Configuration information for the roll.
	 * @param {BaseMessageConfiguration} [message] - Configuration data that guides roll message creation.
	 * @param {BaseDialogConfiguration} [dialog] - Presentation data for the roll configuration dialog.
	 * @returns {Promise<ChallengeRoll[]|void>}
	 */
	async rollSave(config={}, message={}, dialog={}) {
		const { parts, data } = buildRoll({
			driverBonus: this.details.driver?.system.vehicle?.bonuses.roll.damageSave,
			vehicleBonus: this.bonuses.roll.damageSave
		}, this.parent.getRollData());

		const rollConfig = foundry.utils.mergeObject({
			data,
			ability: "con"
		}, config);
		rollConfig.parts = parts.concat(config.parts ?? []);

		const type = game.i18n.localize("EH.Vehicle.Roll.DamageSave.Label");
		const messageConfig = foundry.utils.mergeObject({
			data: {
				title: `${type}: ${this.parent.name}`,
				flavor: type,
				"flags.everyday-heroes.roll": {
					type: "vehicle-save"
				}
			}
		}, message);

		const dialogConfig = foundry.utils.mergeObject({
			options: { title: game.i18n.format("EH.Roll.Configuration.LabelSpecific", { type }) }
		}, dialog);

		return this.parent.rollAbilitySave(rollConfig, messageConfig, dialogConfig);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Socket Event Handlers                    */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async _preUpdate(changed, options, user) {
		const newSize = foundry.utils.getProperty(changed, "system.traits.size");
		if ( (newSize === this.traits.size)
			|| foundry.utils.hasProperty(changed, "prototypeToken.width")
			|| foundry.utils.hasProperty(changed, "prototypeToken.height") ) return;
		const size = CONFIG.EverydayHeroes.sizes[newSize]?.token;
		changed.prototypeToken ??= {};
		changed.prototypeToken.width = size;
		changed.prototypeToken.height = size;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async _preCreate(data, options, user) {
		if ( options.keepEmbeddedId ) return;
		this.parent.updateSource({"system.details.driver": null, "system.people": []});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_onUpdate(changes, options, user) {
		super._onUpdate(changes, options, user);
		if ( !this.shouldPrepareFinalData ) this.prepareFinalData();
	}
}
