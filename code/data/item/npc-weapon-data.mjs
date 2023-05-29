import { numberFormat } from "../../utils.mjs";
import WeaponData from "./weapon-data.mjs";

/**
 * Data definition for NPC Weapon items.
 *
 * @property {object} description
 * @property {string} description.npc - Description that appears for weapon on NPC details tab.
 * @property {object} target
 * @property {number} target.value - Number of targets for this weapon.
 * @property {string[]} target.conditions - Conditions required on the target to make the attack.
 * @property {string} target.custom - Custom target text that replaces automatically generated version.
 */
export default class NPCWeaponData extends WeaponData {

	static get metadata() {
		return foundry.utils.mergeObject(super.metadata, {
			type: "npcWeapon",
			localization: "EH.Item.Type.NPCWeapon"
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			description: new foundry.data.fields.SchemaField({
				npc: new foundry.data.fields.HTMLField({nullable: true, label: ""})
			}),
			target: new foundry.data.fields.SchemaField({
				value: new foundry.data.fields.NumberField({initial: 1, min: 0, integer: true, label: "EH.Target.Count.Label"}),
				conditions: new foundry.data.fields.ArrayField(new foundry.data.fields.StringField(), {
					label: "EH.Target.Conditions.Label", hint: "EH.Target.Conditions.Hint"
				}),
				custom: new foundry.data.fields.StringField({label: "EH.Target.Custom.Label"})
			}, {label: "EH.Target.Label[other]"})
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Modes that should be listed on the details description.
	 * @type {string[]}
	 */
	get npcModes() {
		const modes = this.modes;
		["offhand", "suppressiveFire", "thrown"].forEach(m => delete modes[m]);
		return modes;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get types() {
		return CONFIG.EverydayHeroes.weaponTypes;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Migrations                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static migrateTarget(source) {
		source.target ??= {};
		source.target.value ??= 1;
		source.target.conditions ??= [];
		source.target.custom ??= "";
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedDamage() {
		super.prepareDerivedDamage();
		if ( this.mode === "swarm" ) {
			this.damage.modify({ number: -Math.ceil(this.damage.number / 2) });
			this.supplementalDamage.forEach(s => s.modify({ number: -Math.ceil(s.number / 2) }));
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedTarget() {
		if ( this.target.value ) {
			const count = game.i18n.has(`EH.Number[${this.target.value}]`)
				? game.i18n.localize(`EH.Number[${this.target.value}]`) : numberFormat(this.target.value);
			const pluralRules = new Intl.PluralRules(game.i18n.lang);
			const target = game.i18n.localize(`EH.Target.Label[${pluralRules.select(this.target.value)}]`).toLowerCase();

			// Conditions required to target
			if ( this.target.conditions.length ) {
				const listFormatter = new Intl.ListFormat(game.i18n.lang, { style: "long", type: "disjunction" });
				const conditions = this.target.conditions.map(c => CONFIG.EverydayHeroes.conditions[c]?.label);
				this.target.generated = game.i18n.format("EH.Target.Description.Conditions", {
					count, target,
					conditions: listFormatter.format(conditions.filter(c => c))
				});
			}

			// Unconditional targeting
			else {
				this.target.generated = game.i18n.format("EH.Target.Description.Simple", { count, target });
			}

			// Swarm attacks with a reach of 0 can only affect their own space
			if ( (this.type.value === "melee") && (this.range.reach === 0) && this.properties.has("swarm") ) {
				this.target.generated = game.i18n.format("EH.Target.Description.Swarm", {
					description: this.target.generated
				});
			}
		}

		// No targets
		else {
			this.target.generated = game.i18n.localize("EH.Target.Description.None");
		}

		this.target.description = this.target.custom ? this.target.custom : this.target.generated;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Helpers                                  */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async npcDescription() {
		let description = `<p><em>${this._npcAttackType()}:</em> `;

		const elements = [];
		const listFormatter = new Intl.ListFormat(game.i18n.lang, { type: "unit" });

		// To Hit
		elements.push(`<a data-action="roll-item" data-type="attack">${
			game.i18n.format("EH.Weapon.ToHit", {mod: numberFormat(this.attackMod, {sign: true})}).toLowerCase()}</a>`);

		// Penetration Value
		elements.push(`${game.i18n.localize("EH.Equipment.Trait.PenetrationValue.Abbreviation")} ${
			(this.hasDamage && this.penetrationValue !== null)
				? numberFormat(this.penetrationValue)
				: game.i18n.localize("EH.NotApplicable.Abbreviation")
		}`);

		// Range & Reach
		elements.push(this._npcRangeAndReach());

		// Targets
		elements.push(this.target.description);

		// Damage types
		if ( this.hasDamage ) elements.push(this._npcDamages());

		description += `${listFormatter.format(elements.filter(e => e))} `;

		// Property hints
		for ( const property of this.properties ) {
			const config = CONFIG.EverydayHeroes.equipmentProperties[property];
			if ( config?.npcHint ) description += config.npcHint;
		}

		if ( this.description.chat ) description += this.description.chat.replace(/^<p>/, " ");
		else description += "</p>";

		return await TextEditor.enrichHTML(description, {
			secrets: this.parent.isOwner, rollData: this.parent.getRollData(), async: true, relativeTo: this.parent
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare the attack type description for this weapon's NPC description.
	 * @returns {string}
	 */
	_npcAttackType() {
		if ( !this.type.value ) return game.i18n.localize("EH.Weapon.Action.AttackGeneric");
		let types = [this.type.value];
		const listFormatter = new Intl.ListFormat(game.i18n.lang, { type: "disjunction" });
		if ( this.type.value === "melee" && this.properties.has("thrown") ) types.push("ranged");
		types = types.map(t => CONFIG.EverydayHeroes.weaponTypes[t].label);
		return game.i18n.format("EH.Weapon.Action.AttackSpecific", {type: listFormatter.format(types)});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare the range and reach info for this weapon's NPC description.
	 * @returns {string}
	 */
	_npcRangeAndReach() {
		const elements = [];
		const listFormatter = new Intl.ListFormat(game.i18n.lang, { type: "disjunction" });

		// Reach
		if ( this.type.value === "melee" ) elements.push(`${
			game.i18n.localize("EH.Equipment.Trait.Range.Reach").toLowerCase()} ${
			numberFormat(this.range.reach ?? 5, {unit: this.range.units})}`
		);

		// Range
		if ( ((this.type.value === "ranged") || this.properties.has("thrown")) && this.range.short ) {
			const distance = this.range.long > this.range.short
				? `${numberFormat(this.range.short)}/${numberFormat(this.range.long, {unit: this.range.units})}`
				: numberFormat(this.range.short, {unit: this.range.units});
			elements.push(`${game.i18n.localize("EH.Equipment.Trait.Range.Label").toLowerCase()} ${distance}`);
		}

		return listFormatter.format(elements);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Prepare the hit section of this weapon's NPC description.
	 * @returns {string}
	 */
	_npcDamages() {
		const modes = this.npcModes;
		const damages = [];
		const listFormatter = new Intl.ListFormat(game.i18n.lang, {type: "disjunction", style: "short"});

		const damageBit = (damage, mod) => {
			let bit = damage.average(mod);
			if ( damage.denomination ) bit += ` (${damage.formula(mod)})`;
			const damages = damage.type === "multiple" ? damage.alternateTypes : [damage.type];
			bit += ` ${game.i18n.format("EH.Damage.Specific", { type: listFormatter.format(damages) }).toLowerCase()}`;
			return bit;
		};

		for ( const [mode, config] of Object.entries(modes) ) {
			const clone = this.parent.clone({"system._modeOverride": mode});

			let string = `<a data-action="roll-item" data-type="damage" data-mode="${mode}">`;
			const damageBits = [damageBit(clone.system.damage, clone.system.damageMod)];
			for ( const supplementalDamage of clone.system.supplementalDamage ) {
				damageBits.push(damageBit(supplementalDamage));
			}
			string += damageBits.join(game.i18n.localize("EH.Damage.Plus"));
			string += "</a>";
			if ( config.npcHint && damages.length ) string += ` ${config.npcHint}`;
			damages.push(string);
		}

		return `<em>Hit:</em> ${listFormatter.format(damages)}.`;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async npcLabel() {
		let label = `<a data-action="roll-item" data-type="activate">${this.parent.name}</a>`;
		if ( this.rounds.capacity ) {
			label += ` <span>(${this.reload ? '<a data-action="item" data-type="reload">' : ""}`;
			label += `${numberFormat(this.rounds.available)}/${numberFormat(this.rounds.capacity)} ${
				game.i18n.format("EH.Ammunition.Rounds.Label[other]")}`;
			if ( this.reload ) label += `; ${CONFIG.EverydayHeroes.actionTypesReload[this.reload].toLowerCase()}`;
			label += `${this.reload ? "</a>" : ""})</span>`;
		}
		return label;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Socket Event Handlers                    */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async _preCreate(data, options, user) {
		if ( this.parent.parent && this.parent.parent?.type !== "npc" ) this.parent.updateSource({type: "weapon"});
	}
}
