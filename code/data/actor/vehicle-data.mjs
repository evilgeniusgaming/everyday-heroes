import VehicleSheet from "../../applications/actor/vehicle-sheet.mjs";
import { buildRoll } from "../../dice/utils.mjs";
import { numberFormat, simplifyBonus } from "../../utils.mjs";
import ActorDataModel from "../abstract/actor-data-model.mjs";
import DocumentContextField from "../fields/document-context-field.mjs";
import FormulaField from "../fields/formula-field.mjs";
import LocalDocumentField from "../fields/local-document-field.mjs";
import MappingField from "../fields/mapping-field.mjs";
import ConditionsTemplate from "./templates/conditions-template.mjs";
import SizeTemplate from "./templates/size-template.mjs";

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
 * Data for items in the vehicle.
 *
 * @typedef {object} VehicleItemData
 * @property {ItemEH} [ammunition] - Equipped ammunition for a weapon.
 * @property {ActorEH} [crewMember] - Person operating this weapon.
 * @property {boolean} equipped - Is this piece of equipment currently mounted or in cargo?
 * @property {string} [mode] - Mode the weapon is currently operating in.
 */

/**
 * Data for people in the vehicle.
 *
 * @typedef {object} VehiclePersonData
 * @property {number} sort - Sorting value of the person.
 * @property {ItemEH} weapon - Weapon this person is currently crewing.
 */

/**
 * Data definition for Vehicle actors.
 * @mixes {@link ConditionsTemplate}
 * @mixes {@link SizeTemplate}
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
 * @property {object} details
 * @property {ActorEH} details.driver - Driver of the vehicle.
 * @property {object} details.passengers
 * @property {number} details.passengers.min - Minimum passenger range.
 * @property {number} details.passengers.max - Maximum number of passengers.
 * @property {number} details.price - Price value.
 * @property {Object<VehicleItemData>} items - Configuration data for embedded items.
 * @property {Object<VehiclePersonData>} people - All people currently in the vehicle.
 * @property {object} traits
 * @property {object} traits.properties - Properties of this vehicle.
 * @property {string} traits.size - Size of the vehicle.
 */
export default class VehicleData extends ActorDataModel.mixin(ConditionsTemplate, SizeTemplate) {

	static metadata = {
		type: "vehicle",
		localization: "EH.Actor.Type.Vehicle",
		icon: "fa-solid fa-truck-pickup",
		image: "systems/everyday-heroes/artwork/svg/actors/vehicle.svg",
		sheet: {
			application: VehicleSheet,
			label: "EH.Sheet.Vehicle"
		}
	};

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			abilities: new MappingField(new foundry.data.fields.SchemaField({
				mod: new foundry.data.fields.NumberField({
					required: true, nullable: false, initial: 0, integer: true, label: "EH.Ability.Modifier"
				}),
				bonuses: new foundry.data.fields.SchemaField({
					check: new FormulaField({label: "EH.Ability.Bonus.Check.Label", hint: "EH.Ability.Bonus.Check.SpecificHint"}),
					save: new FormulaField({label: "EH.Ability.Bonus.Save.Label", hint: "EH.Ability.Bonus.Save.SpecificHint"})
				})
			}), {initialKeys: CONFIG.EverydayHeroes.vehicleAbilities, prepareKeys: true, label: "EH.Ability.Label[other]"}),
			attributes: new foundry.data.fields.SchemaField({
				armor: new foundry.data.fields.SchemaField({
					value: new foundry.data.fields.NumberField({
						initial: 0, min: 0, integer: true, label: "EH.Vehicle.Trait.ArmorValue.Body.Label"
					})
				}, {label: "EH.Equipment.Trait.ArmorValue.Label", hint: "EH.Vehicle.Trait.ArmorValue.Hint"}),
				defense: new foundry.data.fields.SchemaField({
					bonus: new FormulaField({deterministic: true, label: "EH.Defense.Bonus.Label", hint: "EH.Defense.Bonus.Hint"})
				}, {label: "EH.Defense.Label"}),
				speed: new foundry.data.fields.SchemaField({
					category: new foundry.data.fields.StringField({
						initial: "stopped", label: "EH.Vehicle.Trait.SpeedCategory.Label", hint: "EH.Vehicle.Trait.SpeedCategory.Hint",
						suggestions: CONFIG.EverydayHeroes.vehicleSpeedCategories
					}),
					min: new foundry.data.fields.NumberField({min: 0, integer: true, label: "EH.Range.Min"}),
					max: new foundry.data.fields.NumberField({min: 0, integer: true, label: "EH.Range.Max"}),
					units: new foundry.data.fields.StringField({
						initial: "miles-per-hour", label: "EH.Measurement.Units", suggestions: CONFIG.EverydayHeroes.speedUnits
					})
				}, {label: "EH.Vehicle.Trait.TopSpeed.Label"}),
				type: new foundry.data.fields.SchemaField({
					value: new foundry.data.fields.StringField({
						label: "EH.Vehicle.Type.Label", suggestions: CONFIG.EverydayHeroes.vehicleTypes
					}),
					category: new foundry.data.fields.StringField({
						label: "EH.Vehicle.Category.Label", suggestions: CONFIG.EverydayHeroes.vehicleCategories
					})
				})
			}, {label: "EH.Attributes.Label"}),
			biography: new foundry.data.fields.SchemaField({
				value: new foundry.data.fields.HTMLField({label: "EH.Biography.Full"}),
				public: new foundry.data.fields.HTMLField({label: "EH.Biography.Public"}),
				notes: new foundry.data.fields.HTMLField({label: "EH.Biography.Notes"})
			}, {label: "EH.Biography.Label"}),
			bonuses: new foundry.data.fields.SchemaField({
				roll: new MappingField(new FormulaField(), {
					label: game.i18n.format("EH.Vehicle.Bonus.LabelSpecific[other]", {
						type: game.i18n.localize("EH.Dice.Action.Roll")
					}), suggestions: CONFIG.EverydayHeroes.vehicleRolls
				})
			}, {label: "EH.Bonus.Global.Label[other]"}),
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
			items: new DocumentContextField(foundry.documents.BaseItem, {
				ammunition: new LocalDocumentField(foundry.documents.BaseItem),
				crewMember: new foundry.data.fields.ForeignDocumentField(foundry.documents.BaseActor),
				equipped: new foundry.data.fields.BooleanField({initial: true, label: "EH.Item.State.Equipped"}),
				mode: new foundry.data.fields.StringField({
					required: false, initial: undefined, label: "EH.Item.Mode.Label", hint: "EH.Item.Mode.Hint",
					suggestions: CONFIG.EverydayHeroes.weaponModes
				})
			}, {label: "EH.Item.Context.Label", hint: "EH.Item.Context.Hint"}),
			people: new DocumentContextField(foundry.documents.BaseActor, {
				sort: new foundry.data.fields.IntegerSortField()
			}, {foreign: true, label: "EH.Vehicle.People.Label[other]", hint: "EH.Vehicle.People.Hint"}),
			traits: new foundry.data.fields.SchemaField({
				properties: new foundry.data.fields.SetField(new foundry.data.fields.StringField({
					suggestions: CONFIG.EverydayHeroes.vehicleProperties
				}), {
					label: "EH.Vehicle.Property.Label"
				}),
				size: new foundry.data.fields.StringField({
					initial: "huge", label: "EH.Vehicle.Size.Label", suggestions: CONFIG.EverydayHeroes.vehicleSizes
				})
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
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareBaseArmorValue() {
		this.attributes.armor.windowsTires = 1;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareBasePeople() {
		for ( const k of this.people.keys() ) {
			const person = this.people.get(k);
			if ( !person.document ) continue;
			person.document.linked[this.parent.uuid] = this.parent;
			Object.defineProperty(person, "weapon", {
				get: () => this.items.find(v => v.crewMember === person.document)?.document,
				configurable: true
			});
		}
		if ( !this.people.get(this._source.details.driver) ) {
			Object.defineProperty(this.details, "driver", { value: null, configurable: true });
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareEmbeddedModifications() {
		this.parent.itemTypes.vehicleModification.forEach(m => m.system.applyModifications(this));
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedAbilities() {
		const rollData = this.details.driver?.getRollData({deterministic: true}) ?? {};
		for ( const [key, ability] of Object.entries(this.abilities) ) {
			ability._source = this._source.abilities?.[key] ?? {};
			if ( !this.details.driver ) continue;
			const driverBonus = simplifyBonus(this.details.driver.system.vehicle?.bonuses.ability[key] ?? "", rollData);
			ability.mod += driverBonus;
			if ( key === "str" && this.traits.properties.has("musclePowered") ) {
				ability.mod += this.details.driver.system.abilities?.str?.mod ?? 0;
			}
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedArmorValue() {
		const armor = this.attributes.armor;
		if ( this.traits.properties.has("bulletproof") ) armor.windowsTires += 2;
		armor.label = `${numberFormat(armor.value)} (${game.i18n.format(
			"EH.Vehicle.Trait.ArmorValue.WindowsTires.LabelSpecific", { number: numberFormat(armor.windowsTires) }
		)})`;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedDefense() {
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

		// Ensure the person isn't already in another vehicle, only if the actor's token is linked
		const otherVehicle = actor.system.vehicle?.actor;
		if ( actor.prototypeToken.actorLink && otherVehicle && (otherVehicle !== this.parent) ) {
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
			try {
				await otherVehicle.system.removePerson(actor);
			} catch(err) {
				console.error(err.message);
			}
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
		const updates = { [`system.people.${actor.id}`]: { sort } };
		if ( driver ) updates["system.details.driver"] = actor.id;
		await this.parent.update(updates);
		if ( actor.isOwner ) await actor.update({"system.vehicle.actor": this.parent.id});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Assign a crew member to a integrated vehicle weapon.
	 * @param {ActorEH} actor - Crew member whose assignment should be modified.
	 * @param {ItemEH} [weapon] - Weapon to assign, or nothing to un-assign the crew member from any weapon.
	 */
	async crewWeapon(actor, weapon) {
		const updates = {};
		const currentWeapon = this.people.get(actor.id).weapon;
		if ( currentWeapon ) updates[`system.items.${currentWeapon.id}.crewMember`] = null;
		if ( weapon ) updates[`system.items.${weapon.id}.crewMember`] = actor.id;
		this.parent.update(updates);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Remove a person from the vehicle.
	 * @param {ActorEH} actor - Actor to remove.
	 */
	async removePerson(actor) {
		if ( !this.people.get(actor.id) ) throw new Error(`Actor ${actor.name} not found in the vehicle.`);
		const updates = { [`system.people.-=${actor.id}`]: null };
		if ( this.details.driver === actor ) updates["system.details.driver"] = null;
		await this.parent.update(updates);
		delete actor.linked[this.parent.uuid];
		if ( (actor.system.vehicle?.actor === this.parent) && actor.isOwner ) {
			await actor.update({"system.vehicle.actor": null});
		}
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

	async _preCreateToken(data, options, user) {
		if ( !data.prototypeToken ) this.parent.updateSource({prototypeToken: {actorLink: true, disposition: 0}});
		if ( !options.keepEmbeddedId ) this.parent.updateSource({"system.details.driver": null, "system.people": {}});
	}
}
