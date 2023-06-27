import Proficiency from "../../documents/proficiency.mjs";
import WeaponData from "./weapon-data.mjs";

/**
 * Data definition for integrated Vehicle weapon items.
 *
 */
export default class VehicleWeaponData extends WeaponData {

	static get metadata() {
		return foundry.utils.mergeObject(super.metadata, {
			type: "vehicleWeapon",
			localization: "EH.Item.Type.VehicleWeapon",
			variant: "weapon"
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		return this.mergeSchema(super.defineSchema(), {
			type: new foundry.data.fields.SchemaField({
				value: new foundry.data.fields.StringField({initial: "ranged"}),
				category: new foundry.data.fields.StringField({initial: "military"})
			}, {label: "EH.Item.Type.Label"})
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get actions() {
		return this.usable ? super.actions : [];
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get types() {
		return CONFIG.EverydayHeroes.weaponTypes;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Can this weapon currently be fired?
	 * @type {boolean}
	 */
	get usable() {
		return this.equipped && this.actor;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get user() {
		return this.actor?.system.people?.get?.(this.actorContext?.crewMember)?.actor ?? null;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Socket Event Handlers                    */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	_onCreate(data, options, userId) {
		super._onCreate(data, options, userId);
		if ( (userId !== game.user.id) || !this.actor ) return;
		this.actor.update({[`system.items.${this.parent.id}.equipped`]: true});
	}
}
