/**
 * Extended version of `TokenDocument` class to support Everyday Heroes combat concepts.
 */
export default class TokenDocumentEH extends TokenDocument {

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Center of the token.
	 * @type {object}
	 */
	get center() {
		return {
			x: this.x + (this.width * this.parent.dimensions.size * 0.5),
			y: this.y + (this.height * this.parent.dimensions.size * 0.5)
		};
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * @typedef {object} TemplateOriginPoint
	 * @property {number} x
	 * @property {number} y
	 * @property {number} direction - Direction from token center to this point.
	 */

	/**
	 * Points on the border of this token where emission templates can start. These points are at each corner
	 * of the token and along each edge at a distance of half a grid unit.
	 * @type {TemplateOriginPoint[]}
	 */
	get templateOriginPoints() {
		const center = this.center;
		const size = this.parent.dimensions.size;
		const points = [];
		const addPoint = (x, y) => points.push({x: this.x + (x * size), y: this.y + (y * size)});
		let x = 0;
		let y = 0;
		while ( x < this.width ) {
			addPoint(x, y);
			x += 0.5;
		}
		while ( y < this.height ) {
			addPoint(x, y);
			y += 0.5;
		}
		while ( x > 0 ) {
			addPoint(x, y);
			x -= 0.5;
		}
		while ( y > 0 ) {
			addPoint(x, y);
			y -= 0.5;
		}
		points.forEach(p => p.direction = Math.normalizeDegrees(Math.toDegrees(
			Math.atan2(p.y - center.y, p.x - center.x)
		)));
		return points;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Methods                                  */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	getBarAttribute(...args) {
		const data = super.getBarAttribute(...args);
		if ( data && (data.attribute === "attributes.hp") ) {
			const hp = this.actor.system.attributes.hp;
			data.value += hp?.temp ?? 0;
		}
		return data;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async toggleActiveEffect(effectData, {overlay=false, active}={}) {
		if ( !this.actor || !effectData.id ) return false;

		// Remove an existing effect
		const existing = this.actor.effects.reduce((arr, e) => {
			if ( ((game.release.generation < 11) && (e.getFlag("core", "statusId") === effectData.id))
				|| ((game.release.generation > 10) && (e.statuses.size === 1) && e.statuses.has(effectData.id)) ) {
				arr.push(e.id);
			}
			return arr;
		}, []);
		const state = active ?? !existing.length;
		if ( !state && existing.length ) {
			await this.actor.deleteEmbeddedDocuments("ActiveEffect", existing);
		}

		// Add a new effect
		else if ( state ) {
			const cls = getDocumentClass("ActiveEffect");
			const condition = CONFIG.EverydayHeroes.registration.get("condition", effectData.id);
			let createData;
			if ( condition ) {
				const conditionDocument = await fromUuid(condition.sources[0]);
				createData = conditionDocument.system.levels[0]?.effect?.toObject();
				createData.icon = effectData.icon;
			} else {
				createData = foundry.utils.deepClone(effectData);
				if ( game.release.generation < 11 ) createData.label = game.i18n.localize(effectData.label);
				else createData.name = game.i18n.localize(effectData.name);
			}
			if ( game.release.generation < 11 ) createData["flags.core.statusId"] = effectData.id;
			else {
				createData.statuses = [effectData.id];
				if ( createData.flags?.core?.statusId ) delete createData.flags.core.statusId;
			}
			if ( overlay ) createData["flags.core.overlay"] = true;
			delete createData.id;
			if ( game.release.generation > 10 ) {
				cls.migrateDataSafe(createData);
				cls.cleanData(createData);
			}
			await cls.create(createData, {parent: this.actor});
		}
		return state;
	}
}
