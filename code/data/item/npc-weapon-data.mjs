import { numberFormat } from "../../utils.mjs";
import WeaponData from "./weapon-data.mjs";

/**
 * Data definition for NPC Weapon items.
 *
 * @property {object} description
 * @property {string} description.npc - Description that appears for weapon on NPC details tab.
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
			})
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
			this.hasDamage ? numberFormat(this.penetrationValue) : game.i18n.localize("EH.NotApplicable.Abbreviation")}`);

		// Range & Reach
		elements.push(this._npcRangeAndReach());

		// Targets
		// TODO: Add support for weapon targets

		// Damage types
		if ( this.hasDamage ) elements.push(this._npcDamages());

		description += `${listFormatter.format(elements.filter(e => e))}</p>`;

		if ( this.description.chat ) {
			description += await TextEditor.enrichHTML(this.description.chat ?? "", {
				secrets: this.parent.isOwner, rollData: this.parent.getRollData(), async: true, relativeTo: this.parent
			});
		}

		return description;
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

		for ( const [mode, config] of Object.entries(modes) ) {
			const clone = this.parent.clone({"system._modeOverride": mode});

			const type = game.i18n.format("EH.Damage.Specific", {
				type: CONFIG.EverydayHeroes.damageTypes[clone.system.damage.type]?.label
			});
			let string = `<a data-action="roll-item" data-type="damage" data-mode="${mode}">`;
			string += clone.system.damage.average;
			if ( clone.system.damage.denomination ) string += ` (${clone.system.damageFormula})`;
			string += ` ${type.toLowerCase()}</a>`;
			if ( config.npcHint && (Object.values(modes).length > 1) ) string += ` ${config.npcHint}`;
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
}
