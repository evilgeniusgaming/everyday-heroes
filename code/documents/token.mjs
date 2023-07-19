/**
 * Extended version of `TokenDocument` class to support Everyday Heroes combat concepts.
 */
export default class TokenDocumentEH extends TokenDocument {
	getBarAttribute(...args) {
		const data = super.getBarAttribute(...args);
		if ( data && (data.attribute === "attributes.hp") ) {
			const hp = this.actor.system.attributes.hp;
			data.value += hp?.temp ?? 0;
		}
		return data;
	}

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
}
