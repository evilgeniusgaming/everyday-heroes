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

	/**
	 * The actor currently crewing this weapon, if any.
	 * @type {ActorEH|null}
	 */
	get crewMember() {
		return this.parent?.actor?.system.people?.get?.(
			this.parent?.actor?.system.items[this.parent?.id]?.crewMember
		)?.actor ?? null;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	get types() {
		return CONFIG.EverydayHeroes.weaponTypes;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareDerivedProficiency() {
		console.log(this.parent.name, "prepareDerivedProficiency");
		let proficiency = 0;
		let hasProf = false;
		const crewMember = this.crewMember;
		if ( this.equipped && crewMember ) {
			proficiency = crewMember.system.attributes?.prof ?? 0;
			hasProf = crewMember.system.traits?.equipment
				? crewMember.system.traits.equipment.has(this.type.category) : true;
		}
		console.log(proficiency, hasProf);
		this.proficiency = new Proficiency(proficiency, hasProf ? 1 : 0);
	}
}
