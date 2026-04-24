import { createFormOptions } from "../../utils.mjs";
import BaseItemSheetV2 from "./base-item-sheet-v2.mjs";

/**
 * Sheet that represents Armor, Weapon, Explosive, and Gear items.
 */
export default class PhysicalSheetV2 extends BaseItemSheetV2 {

	/** @override */
	static DEFAULT_OPTIONS = {
		actions: {
			addSupplementalDamage: PhysicalSheetV2.#onAddSupplementalDamage,
			removeSupplementalDamage: PhysicalSheetV2.#onRemoveSupplementalDamage
		},
		classes: ["physical"]
	};

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Rendering                                */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @inheritDoc */
	async _prepareDetailsContext(context, options) {
		context = await super._prepareDetailsContext(context, options);

		context.fields = [
			this._createFormField(context, "type.category", {
				options: createFormOptions(CONFIG.EverydayHeroes.equipmentCategories)
			}),
			context.system.types ? this._createFormField(context, "type.value", {
				options: createFormOptions(context.system.types)
			}) : null,
			...this._prepareActivationFields(context),
			{ header: { text: "EH.Equipment.Property.Label[other]" } },
			{ template: "everydayHeroes.item-properties" },
			this._createFormField(context, "armorValue"),
			...this._prepareRangeFields(context),
			...this._prepareTargetingFields(context),
			...this._prepareDamageFields(context),
			...this._prepareRoundsFields(context),
			...this._prepareBonusesFields(context),
			...this._prepareOverridesFields(context)
		].filter(_ => _);

		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @inheritDoc */
	async _prepareHeaderContext(context, options) {
		context = await super._prepareHeaderContext(context, options);

		context.headerFields.push({
			fields: [
				this._createFormField(context, "price", { classes: "label-top", hint: false }),
				this._createFormField(context, "bulk", { classes: "label-top", hint: false })
			]
		});

		return context;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Field Preparation                        */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare NPC activation fields.
	 * @param {ApplicationRenderContext} context
	 * @returns {object[]}
	 */
	_prepareActivationFields(context) {
		if ( !["npcExplosive", "npcWeapon"].includes(this.item.type) ) return [];
		return [
			{ header: { text: "EH.Activation.Label" } },
			this._createFormField(context, "activation.type", {
				options: createFormOptions(CONFIG.EverydayHeroes.actionTypesWeapon, { blank: false })
			}),
			context.system.hasActionPoints ? this._createFormField(context, "activation.amount", { placeholder: 1 }) : null,
			...this.item.system.createConsumptionFormFields(context)
		];
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare bonuses fields.
	 * @param {ApplicationRenderContext} context
	 * @returns {object[]}
	 */
	_prepareBonusesFields(context) {
		if ( !("bonuses" in context.system) ) return [];
		return [
			{ header: { text: "EH.Bonus.Label[other]" } },
			this._createFormField(context, "bonuses.attack"),
			this._createFormField(context, "bonuses.dc"),
			this._createFormField(context, "bonuses.damage"),
			"critical" in context.system.bonuses ? {
				fields: [
					this._createFormField(context, "bonuses.critical.dice", { classes: "label-top" }),
					this._createFormField(context, "bonuses.critical.damage", { classes: "label-top" })
				],
				group: {
					label: "EH.Weapon.Bonus.Critical.Label"
				}
			} : null,
			this._createFormField(context, "bonuses.save")
		];
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare damage fields.
	 * @param {ApplicationRenderContext} context
	 * @returns {object[]}
	 */
	_prepareDamageFields(context) {
		if ( !("damage" in context.system) ) return [];
		const fields = [{ header: { text: "EH.Equipment.Trait.Damage.Label" } }];
		const hasDamage = this.item.system.hasDamage;

		if ( this.item.system.damageMode === "regular" ) {
			const damageTypeOptions = [
				{ value: "", label: _loc("EH.Damage.None"), rule: true },
				...Object.entries(CONFIG.EverydayHeroes.damageTypes).map(([value, { label }]) => ({ value, label })),
				{ rule: true },
				{ value: "multiple", label: _loc("EH.Damage.Multiple") }
			];

			const denominationOptions = CONFIG.EverydayHeroes.diceSteps.map(n => ({ value: n, label: `d${n}` }));

			fields.push(
				{
					fields: [
						hasDamage ? this._createFormField(context, "damage.number", { classes: "label-top" }) : null,
						hasDamage ? this._createFormField(context, "damage.denomination", {
							classes: "label-top", options: denominationOptions
						}) : null,
						this._createFormField(context, "damage.type", { classes: "label-top", options: damageTypeOptions })
					],
					group: {
						hint: "EH.Equipment.Trait.Damage.Hint",
						label: "EH.Equipment.Trait.Damage.Label"
					}
				},
				context.source.damage.type === "multiple" ? this._createFormField(context, "damage.alternateTypes", {
					options: createFormOptions(CONFIG.EverydayHeroes.damageTypes, { blank: false })
				}) : null
			);
			if ( hasDamage ) {
				fields.push(
					this._createFormField(context, "penetrationValue", { placeholder: _loc("EH.Damage.IgnoresArmor.Label") }),
					{
						fields: [{
							html: `
							<button type="button" class="icon fa-solid fa-plus" data-action="addSupplementalDamage" data-tooltip
											aria-label="${_loc(
								"EH.Action.AddSpecific", { type: _loc("EH.Equipment.Trait.SupplementalDamage.Label") }
							)}"></button>
							`
						}],
						group: {
							hint: "EH.Equipment.Trait.SupplementalDamage.Hint",
							label: "EH.Equipment.Trait.SupplementalDamage.Label"
						}
					}
				);
				const supplementalElement = this.item.system.schema.fields.supplementalDamage.element;
				const createSupplementalField = (index, data, keyPath, options) => ({
					field: supplementalElement.getField(keyPath),
					localize: true,
					name: `system.supplementalDamage.${index}.${keyPath}`,
					value: foundry.utils.getProperty(data, keyPath),
					...options
				});
				for ( const [i, d] of context.source.supplementalDamage.entries() ) fields.push(
					{
						fields: [
							createSupplementalField(i, d, "number", { classes: "label-top third-width" }),
							createSupplementalField(i, d, "denomination", {
								classes: "label-top third-width", options: denominationOptions
							}),
							{ html: '<span class="separator">+</span>' },
							createSupplementalField(i, d, "bonus", { classes: "label-top third-width" }),
							createSupplementalField(i, d, "type", {
								classes: "label-top", options: createFormOptions(CONFIG.EverydayHeroes.damageTypes)
							}),
							{
								fields: [
									createSupplementalField(i, d, "customPV", { classes: "label-hidden collapse-width", hint: false }),
									createSupplementalField(i, d, "penetrationValue", {
										classes: "label-hidden", disabled: !d.customPV, hint: false,
										placeholder: d.customPV || context.source.penetrationValue === null
											? _loc("EH.Damage.IgnoresArmor.Label") : context.source.penetrationValue
									})
								],
								group: {
									classes: "label-top",
									label: "EH.Equipment.Trait.PenetrationValue.Label"
								}
							},
							{
								html: `
								<button type="button" class="icon fa-solid fa-trash" data-action="removeSupplementalDamage"
								        data-tooltip aria-label="${_loc(
									"EH.Action.RemoveSpecific", { type: _loc("EH.Equipment.Trait.SupplementalDamage.Label") }
								)}"></button>
								`
							}
						],
						group: {
							classes: "full-width supplemental-damage",
							dataset: { index: i }
						}
					}
				);
			}
		}

		else if ( this.item.system.damageMode === "modification" ) {
			const numberOptions = [];
			const denominationOptions = [];
			const numberFormatter = new Intl.NumberFormat(game.i18n.lang, { signDisplay: "exceptZero" });
			const pluralRule = new Intl.PluralRules(game.i18n.lang);
			for ( let i = -4; i <= 4; i++ ) {
				const number = numberFormatter.format(i);
				const pr = pluralRule.select(i);
				numberOptions.push({ value: i, label: _loc(`EH.Dice.Modification.Count[${pr}]`, { number }) });
				denominationOptions.push({ value: i, label: _loc(`EH.Dice.Modification.Denomination[${pr}]`, { number }) });
			}
			fields.push({
				fields: [
					this._createFormField(context, "damage.number", { classes: "label-top", options: numberOptions }),
					this._createFormField(context, "damage.denomination", { classes: "label-top", options: denominationOptions }),
					this._createFormField(context, "damage.type", {
						classes: "label-top",
						options: createFormOptions(CONFIG.EverydayHeroes.damageTypes, {
							blank: _loc("EH.Equipment.Trait.DamageModification.NoChange")
						})
					})
				],
				group: {
					hint: "EH.Equipment.Trait.DamageModification.Hint",
					label: "EH.Equipment.Trait.DamageModification.Label"
				}
			});
		}

		if ( hasDamage ) fields.push(this._createFormField(context, "dc"));

		return fields;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare overrides fields.
	 * @param {ApplicationRenderContext} context
	 * @returns {object[]}
	 */
	_prepareOverridesFields(context) {
		if ( !("overrides" in context.system) ) return [];

		const abilityOverrideOptions = [
			{ value: "", label: _loc("EH.Weapon.Overrides.Ability.Default") },
			{ value: "none", label: _loc("EH.Weapon.Overrides.Ability.None"), rule: true },
			...Object.entries(CONFIG.EverydayHeroes.abilities).map(([value, { label }]) => ({ value, label }))
		];

		return [
			{ header: { text: "EH.Override.Label" } },
			this._createFormField(context, "overrides.ability.attack", { options: abilityOverrideOptions }),
			this._createFormField(context, "overrides.ability.damage", { options: abilityOverrideOptions }),
			this._createFormField(context, "overrides.critical.threshold")
		];
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare range fields.
	 * @param {ApplicationRenderContext} context
	 * @returns {object[]}
	 */
	_prepareRangeFields(context) {
		let lengthUnits = {};
		const isTitanic = this.item.system.isTitanic;
		if ( !isTitanic ) Object.assign(lengthUnits, CONFIG.EverydayHeroes.lengthUnits);
		if ( (isTitanic === true) || (isTitanic === undefined) ) lengthUnits.space = {
			label: game.i18n.localize("EH.Measurement.Length.Space.Label[other]")
		};
		lengthUnits = createFormOptions(lengthUnits, { blank: false });

		return [
			"radius" in context.system ? {
				fields: [
					this._createFormField(context, "radius.value", {
						classes: "label-top", label: "EH.Measurement.Value", hint: false
					}),
					this._createFormField(context, "radius.units", { classes: "label-top", options: lengthUnits })
				],
				group: {
					label: "EH.Equipment.Trait.Radius.Label",
					hint: "EH.Equipment.Trait.Radius.Hint"
				}
			} : null,
			context.system.usesRange ? {
				fields: [
					this._createFormField(context, "range.short", { classes: "label-top" }),
					{ html: '<span class="separator">&sol;</span>' },
					this._createFormField(context, "range.long", { classes: "label-top" }),
					this._createFormField(context, "range.units", { classes: "label-top", options: lengthUnits })
				],
				group: {
					label: "EH.Equipment.Trait.Range.Label"
				}
			} : null,
			context.system.properties?.has?.("reach") ? this._createFormField(context, "range.reach", { hint: false }) : null
		];
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare weapon rounds fields.
	 * @param {ApplicationRenderContext} context
	 * @returns {object[]}
	 */
	_prepareRoundsFields(context) {
		if ( !this.item.system.usesRounds ) return [];

		const roundTypeOptions = [
			{ value: "", label: _loc("EH.Ammunition.Rounds.None") },
			...Object.entries(CONFIG.EverydayHeroes.ammunitionTypes)
				.map(([value, { label }]) => ({ value, label, group: _loc("EH.Item.Type.Ammunition[other]") })),
			...Object.entries(CONFIG.EverydayHeroes.explosiveTypes)
				.map(([value, { label }]) => ({ value, label, group: _loc("EH.Item.Type.Explosive[other]") }))
		];

		return [
			{ header: { text: "EH.Equipment.Trait.Rounds.Label" } },
			this._createFormField(context, "rounds.type", { options: roundTypeOptions }),
			this.item.system.beltFed ? {
				disabled: true,
				field: new foundry.data.fields.StringField(),
				hint: "EH.Equipment.Trait.Rounds.Hint",
				label: "EH.Equipment.Trait.Rounds.Capacity",
				localize: true,
				placeholder: _loc("EH.Weapon.Property.Belt.Tag")
			} : this._createFormField(context, "rounds.capacity"),
			context.system.rounds.capacity || this.item.system.beltFed ? {
				fields: [
					this.item.system.reload.hasCount
						? this._createFormField(context, "reload.value", { classes: "label-top" }) : null,
					this._createFormField(context, "reload.type", {
						classes: "label-top", options: createFormOptions(CONFIG.EverydayHeroes.actionTypesReload, {
							blank: _loc("EH.Action.Reload.None")
						})
					})
				],
				group: {
					label: "EH.Equipment.Trait.Reload.Label"
				}
			} : null,
			this.item.system.properties?.has?.("burst") ? this._createFormField(context, "rounds.burst") : null
		];
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare NPC targeting fields.
	 * @param {ApplicationRenderContext} context
	 * @returns {object[]}
	 */
	_prepareTargetingFields(context) {
		if ( !("value" in (context.system.target ?? {})) ) return [];
		return [
			{ header: { text: "EH.Target.Label[other]" } },
			this._createFormField(context, "target.value"),
			this._createFormField(context, "target.conditions", {
				options: createFormOptions(CONFIG.EverydayHeroes.conditions, { blank: false })
			}),
			this._createFormField(context, "target.custom", { placeholder: context.system.target.generated })
		];
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Event Listeners & Handlers               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle adding a new supplemental damage part.
	 * @this {PhysicalSheet}
	 * @param {Event} event - Triggering click event.
	 * @param {HTMLElement} target - Button that was clicked.
	 */
	static #onAddSupplementalDamage(event, target) {
		const damageCollection = this.item.system.toObject().supplementalDamage ?? [];
		this.submit({ updateData: { "system.supplementalDamage": [...damageCollection, {}] } });
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle remove a supplemental damage part.
	 * @this {PhysicalSheet}
	 * @param {Event} event - Triggering click event.
	 * @param {HTMLElement} target - Button that was clicked.
	 */
	static #onRemoveSupplementalDamage(event, target) {
		const damageCollection = this.item.system.toObject().supplementalDamage ?? [];
		const index = target.closest("[data-index]").dataset.index;
		this.submit({ updateData: { "system.supplementalDamage": damageCollection.toSpliced(index, 1) } });
	}
}
