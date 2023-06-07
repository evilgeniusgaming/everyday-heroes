import { numberFormat, simplifyBonus } from "../../utils.mjs";
import SystemDataModel from "../abstract/system-data-model.mjs";
import FormulaField from "../fields/formula-field.mjs";
import MappingField from "../fields/mapping-field.mjs";

/**
 * Data for a vehicle ability.
 *
 * @typedef {object} VehicleAbilityData
 * @property {number} mod - Ability's modifier.
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
 * @property {object} conditions - Conditions affecting this vehicle.
 * @property {object} details
 * @property {object} details.passengers
 * @property {number} details.passengers.min - Minimum passenger range.
 * @property {number} details.passengers.max - Maximum number of passengers.
 * @property {number} details.price - Price value.
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
			conditions: new MappingField(new foundry.data.fields.NumberField({
				min: 0, integer: true
			}), {label: "EH.Condition.Label[other]"}),
			details: new foundry.data.fields.SchemaField({
				driver: new foundry.data.fields.ForeignDocumentField(foundry.documents.BaseActor, {idOnly: true}),
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
			people: new MappingField(new foundry.data.fields.SchemaField({
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
		return this.details.driver?.system.skills?.[this.traits.properties.has("musclePowered") ? "athl" : "vehi"];
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
		for ( const [id, contents] of Object.entries(this.people) ) contents.actor = game.actors.get(id);
		this.details.driver = this.people[this.details.driver]?.actor;
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
		const driver = this.details.driver;
		if ( !driver ) return;
		const rollData = driver.getRollData({deterministic: true});
		for ( const [key, ability] of Object.entries(this.abilities) ) {
			const driverBonus = simplifyBonus(driver.system.vehicle?.bonuses.ability[key] ?? "", rollData);
			ability.mod = ability._baseMod + driverBonus;
			if ( key === "str" && this.traits.properties.has("musclePowered") ) {
				console.log("prepare muscle-powered strength");
				ability.mod += driver.system.abilities?.str?.mod ?? 0;
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
	addPerson(actor, { driver=false }={}) {
		if ( actor.type === "vehicle" ) throw new Error(game.i18n.localize("EH.Vehicle.Error.NoVehicles"));
		if ( actor.pack ) throw new Error(game.i18n.localize("EH.Vehicle.Error.NoPacks"));
		if ( this.people[actor.id] ) return;

		// Ensure the vehicle isn't full
		if ( this.details.passengers.max ) {
			const peopleCount = Object.values(this.people).filter(p => p.actor).length;
			if ( peopleCount >= this.details.passengers.max ) {
				const pluralRule = new Intl.PluralRules(game.i18n.lang);
				throw new Error(game.i18n.format("EH.Vehicle.Error.NoSpace", {
					number: numberFormat(this.details.passengers.max), people: game.i18n.localize(
						`EH.Vehicle.People.Label[${pluralRule.select(this.details.passengers.max)}]`
					).toLowerCase()
				}));
			}
		}

		const sort = Object.values(this.people)
			.reduce((sort, p) => p.sort > sort ? p.sort : sort, 0) + CONST.SORT_INTEGER_DENSITY;
		const updates = {[`system.people.${actor.id}`]: { sort }};
		if ( driver ) updates["system.details.driver"] = actor.id;
		this.parent.update(updates);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Remove a person from the vehicle.
	 * @param {ActorEH} actor - Actor to remove.
	 */
	removePerson(actor) {
		if ( !this.people[actor.id] ) throw new Error(`Actor ${actor.name} not found in the vehicle.`);
		this.parent.update({[`system.people.-=${actor.id}`]: null});
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
	/*  Socket Event Handlers                    */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_onUpdate(changes, options, user) {
		super._onUpdate(changes, options, user);
		if ( !this.shouldPrepareFinalData ) this.prepareFinalData();
	}
}
