/**
 * Extended version of `Token` class to draw custom HP bar.
 */
export default class TokenEH extends Token {

	_drawBar(number, bar, data) {
		if ( data.attribute === "attributes.hp" ) return this._drawHPBar(number, bar, data);
		return super._drawBar(number, bar, data);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Draw the HP bar with temp HP support.
	 * @param {number} number - The bar number.
	 * @param {PIXI.Graphics} bar - The bar container.
	 * @param {object} data - Resource data for this bar.
	 */
	_drawHPBar(number, bar, data) {
		const {value, max, temp} = this.document.actor.system.attributes.hp;

		const tempPct = Math.clamp(temp, 0, max) / max;
		const valuePct = Math.clamp(value, 0, max) / max;

		const BACKGROUND_COLOR = 0x000000;
		const BORDER_COLOR = 0x000000;
		const TEMP_COLOR = 0x66CCFF;
		const hpColor = Color.fromRGB([(1 - (valuePct / 2)), valuePct, 0]);

		const BORDER_RADIUS = 3;
		const TEMP_RADIUS = 1;
		const VALUE_RADIUS = 2;

		const w = this.w;
		let h = Math.max((canvas.dimensions.size / 12), 8);
		if ( this.document.height >= 2 ) h *= 1.6;
		const borderWidth = Math.clamp(h / 8, 1, 2);

		bar.clear();
		bar.beginFill(BACKGROUND_COLOR, 0.5)
			.lineStyle(borderWidth, BORDER_COLOR)
			.drawRoundedRect(0, 0, w, h, BORDER_RADIUS);
		bar.beginFill(hpColor, 1.0)
			.lineStyle(borderWidth, BORDER_COLOR, 1.0)
			.drawRoundedRect(0, 0, valuePct * w, h, VALUE_RADIUS);
		if ( temp > 0 ) {
			const bs1 = borderWidth + 1;
			bar.beginFill(TEMP_COLOR, 1.0)
				.lineStyle(0)
				.drawRoundedRect(bs1, bs1, (tempPct * w) - (2 * bs1), h - (2 * bs1), TEMP_RADIUS);
		}

		const posY = (number === 0) ? (this.h - h) : 0;
		bar.position.set(0, posY);
	}
}
