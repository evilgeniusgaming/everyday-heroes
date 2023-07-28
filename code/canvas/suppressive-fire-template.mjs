class PlacementCanceledError extends Error {
	constructor(...args) {
		super(...args);
		this.name = "PlacementCanceledError";
	}
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * A version of MeasuredTemplate with helper methods for placing it in the world.
 */
export default class SuppressiveFireTemplate extends MeasuredTemplate {
	constructor(document, origin, maxWidth, maxRange) {
		super(document);
		this.origin = origin;
		this.maxWidth = maxWidth;
		this.maxRange = maxRange;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static PlacementCanceledError = PlacementCanceledError;

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Time in milliseconds to throttle mouse movement updates.
	 * @type {number}
	 */
	static THROTTLE_MS = 20;

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Track bound event handlers so they can be properly canceled later.
	 * @type {object}
	 */
	#events;

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * The initially active CanvasLayer to re-activate after the workflow is complete.
	 * @type {CanvasLayer}
	 */
	#initialLayer;

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Timestamp of the last mouse move that was acted upon.
	 * @type {number}
	 */
	#lastMove = 0;

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Maximum distance from the origin where the end of the cone can be placed.
	 * @type {number}
	 */
	maxRange;

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Maximum width of the end of the cone.
	 * @type {number}
	 */
	maxWidth;

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Token from which the suppressive fire should originate.
	 * @type {TokenDocumentEH}
	 */
	origin;

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * A factory method to create a SuppressiveFireTemplate in the world originating at an origin token.
	 * @param {TokenDocumentEH} origin - Token from which the suppressive fire should originate.
	 * @param {object} config
	 * @param {number} config.maxWidth - Maximum width of the end of the cone.
	 * @param {number} config.maxRange - Maximum distance from the origin where the end of the cone can be placed.
	 * @param {object} [config.templateData={}] - Additional data merged into the final template data.
	 * @returns {SuppressiveFireTemplate}
	 */
	static create(origin, { maxWidth, maxRange, templateData={} }) {
		templateData = foundry.utils.mergeObject({
			t: "cone",
			user: game.user.id,
			angle: 15,
			distance: Math.min(100, maxRange),
			direction: 0,
			x: origin.center.x,
			y: origin.center.y,
			fillColor: game.user.color,
			"flags.everyday-heroes": {
				type: "suppressive-fire",
				origin: origin.uuid,
				maxWidth,
				maxRange
			}
		}, templateData);

		const Cls = CONFIG.MeasuredTemplate.documentClass;
		const document = new Cls(templateData, { parent: canvas.scene });
		const template = new this(document, origin, maxWidth, maxRange);
		return template;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Placement                                */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Activate the template placement interface.
	 * @param {Application} [sheet] - Sheet that will be hidden while placement is in progress.
	 * @returns {Promise} - Resolves with the final template created, or rejects if the process was canceled.
	 */
	async place(sheet) {
		const initialLayer = canvas.activeLayer;

		this.draw();
		this.layer.activate();
		this.layer.preview.addChild(this);

		this.minimizedSheet = sheet;
		this.minimizedSheet?.minimize();

		return this._activatePlacementListeners(initialLayer);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Event Handlers                           */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Activate listeners for template placements.
	 * @param {CanvasLayer} initialLayer
	 * @returns {Promise} - Resolves with the final template created, or rejects if the process was canceled.
	 */
	_activatePlacementListeners(initialLayer) {
		return new Promise((resolve, reject) => {
			this.#initialLayer = initialLayer;
			this.#events = {
				cancel: this._onCancelPlacement.bind(this),
				confirm: this._onConfirmPlacement.bind(this),
				move: this._onMovePlacement.bind(this),
				resolve,
				reject
			};

			canvas.stage.on("mousemove", this.#events.move);
			canvas.stage.on("mousedown", this.#events.confirm);
			canvas.app.view.oncontextmenu = this.#events.cancel;
		});
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Placement was canceled by user.
	 * @param {Event} event - Triggering event.
	 */
	async _onCancelPlacement(event) {
		await this._finishPlacement(event);
		this.#events.reject(new PlacementCanceledError());
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Placement was finalized and template should be placed.
	 * @param {Event} event - Triggering event.
	 */
	async _onConfirmPlacement(event) {
		await this._finishPlacement(event);
		const created = await canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [this.document.toObject()]);
		// This is a fix to a bug with changing layers too quickly after creating a template
		// if more than one template are created in a row.
		await new Promise(resolve => { setTimeout(resolve, 100); });
		this.#events.resolve(created);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Completion steps shared between cancel and placement.
	 * @param {Event} event - Triggering event.
	 */
	async _finishPlacement(event) {
		event.preventDefault?.();
		event.stopPropagation();
		this.layer._onDragLeftCancel(event);
		canvas.stage.off("mousemove", this.#events.move);
		canvas.stage.off("mousedown", this.#events.confirm);
		canvas.app.view.oncontextmenu = null;
		this.#initialLayer.activate();
		await this.minimizedSheet?.maximize();
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Mouse was moved to a new location.
	 * @param {Event} event - Triggering event.
	 */
	_onMovePlacement(event) {
		event.stopPropagation();
		if ( Date.now() - this.#lastMove <= this.constructor.THROTTLE_MS ) return;
		const position = event.data.getLocalPosition(this.layer);
		this.document.updateSource(this.constructor.#positionUpdates(
			position, this.origin, { min: canvas.scene.dimensions.distance, max: this.maxRange},
			this.maxWidth, canvas.scene.dimensions.distancePixels
		));
		this.refresh();
		this.#lastMove = Date.now();
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Calculations                             */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Update the template's direction, angle, and distance based on the current mouse position.
	 * @param {object} position - Current mouse position.
	 * @param {TokenDocumentEH} originToken - Originating token.
	 * @param {object} range
	 * @param {number} range.min - Minimum length from the origin of the template.
	 * @param {number} range.max - Maximum distance from the origin where the end of the cone can be placed.
	 * @param {number} width - Width of the end of the cone.
	 * @param {number} distancePixels - Multiplier between scene units and pixels.
	 * @returns {object}
	 */
	static #positionUpdates(position, originToken, range, width, distancePixels) {
		// Calculate direction between originating token center and current mouse position
		const initialDirection = Math.normalizeDegrees(Math.toDegrees(
			Math.atan2(position.y - originToken.center.y, position.x - originToken.center.x)
		));

		// Select appropriate token corner to act as template origin based on angle
		const origin = this.#selectOriginPoint(originToken.templateOriginPoints, initialDirection);

		// Calculate final template direction based on token corner & mouse position
		const direction = Math.normalizeDegrees(Math.toDegrees(
			Math.atan2(position.y - origin.y, position.x - origin.x)
		));

		// Calculate distance between origin corner and mouse position, clamped by min & max range
		const distance = Math.clamped(
			Math.hypot(position.y - origin.y, position.x - origin.x) / distancePixels, range.min, range.max
		);

		// Calculate cone angle based on `width` and current distance
		const angle = Math.toDegrees(2 * Math.atan2(width * 0.5, distance));

		// Update the template
		const updates = { x: origin.x, y: origin.y, angle, direction, distance };
		return updates;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Select one of the token's origin points that is closest to the current direction.
	 * @param {TemplateOriginPoint[]} points
	 * @param {number} direction
	 * @returns {TemplateOriginPoint}
	 */
	static #selectOriginPoint(points, direction) {
		let bestPoint = null;
		let nearestDistance = Infinity;
		for ( const point of points ) {
			let distance = point.direction - direction;
			distance += (distance > 180) ? -360 : (distance < -180) ? 360 : 0;
			distance = Math.abs(distance);
			if ( distance >= nearestDistance ) continue;
			nearestDistance = distance;
			bestPoint = point;
		}
		return bestPoint;
	}
}
