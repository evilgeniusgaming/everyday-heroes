import SuppressiveFireTemplate from "../canvas/suppressive-fire-template.mjs";

/**
 * Extended version of `ChatMessage` class to display critical highlighting and other system features.
 */
export default class ChatMessageEH extends ChatMessage {

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Properties                               */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Should roll DCs and other challenge details be displayed on this card?
	 * @type {boolean}
	 */
	get shouldDisplayChallenge() {
		if ( game.user.isGM || (this.user === game.user) ) return true;
		switch ( game.settings.get("everyday-heroes", "challengeVisibility") ) {
			case "all": return true;
			case "player": return !this.user.isGM;
			default: return false;
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Rendering                                */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/** @inheritDoc */
	async renderHTML(options={}) {
		const html = await super.renderHTML(options);
		if ( !this.isContentVisible ) return html;

		await this._displayActions(html);
		if ( this.isRoll ) this._highlightRollResults(html);

		return html;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async _renderRollContent(messageData) {
		await super._renderRollContent(messageData);

		// Display total damage for damage rolls
		if ( (messageData.message.flags["everyday-heroes"]?.roll?.type === "damage") && (this.rolls.length > 1) ) {
			const total = this.rolls.reduce((t, r) => t + r.total, 0);
			messageData.message.content += `
				<div class="damage dice-roll">
				  <div class="dice-result">
						<h4 class="dice-total">${game.i18n.localize("EH.Total")}: ${total}</h4>
					</div>
				</div>`;
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Append any actions provided in the flags onto the roll.
	 * @param {HTMLElement} html - Chat message HTML.
	 */
	async _displayActions(html) {
		const chatCard = html.querySelector(".chat-card");
		if ( chatCard ) {
			if ( this.shouldDisplayChallenge ) chatCard.dataset.displayChallenge = "";
			const actions = this.getFlag("everyday-heroes", "actions");
			if ( !actions?.length ) return;
			const actionHTML = await foundry.applications.handlebars.renderTemplate(
				"systems/everyday-heroes/templates/chat/card-actions.hbs",
				{ message: this, actions }
			);
			html.querySelector(".message-content")?.insertAdjacentHTML("beforeend", actionHTML);
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Add classes to roll results to indicate successes and failures.
	 * @param {HTMLElement} html - Chat message HTML.
	 */
	_highlightRollResults(html) {
		const rollResults = html.querySelectorAll(".dice-roll");
		const originatingMessage = game.messages.get(this.getFlag("everyday-heroes", "originatingMessage"));
		const displayChallenge = originatingMessage?.shouldDisplayChallenge;
		for ( const [index, roll] of this.rolls.entries() ) {
			const result = rollResults[index];
			if ( !result ) continue;
			if ( roll.isCriticalSuccess ) result.classList.add("critical-success");
			else if ( roll.isCriticalFailure ) result.classList.add("critical-failure");
			if ( roll.options.target && displayChallenge ) {
				if ( roll.isSuccess ) result.classList.add("success");
				else if ( roll.isFailure ) result.classList.add("failure");
			}
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Add extra context menu options to chat messages for damage application.
	 * @param {jQuery} html - The HTML element to which the context options are attached.
	 * @param {ContextMenuEntry[]} options - The context menu entries.
	 */
	static getContextOptions(html, options) {
		const condition = li => {
			const message = game.messages.get(li.data("messageId"));
			const tokens = canvas.tokens?.controlled.filter(t => t.actor?.system.attributes.hp);
			return message?.isRoll && message?.isContentVisible && tokens?.length;
		};
		options.unshift(
			{
				name: game.i18n.localize("EH.Damage.Action.ApplyNormal"),
				icon: '<i class="fa-solid fa-user-minus"></i>',
				condition,
				callback: li => ChatMessageEH.applyDamage(li, 1)
			},
			{
				name: game.i18n.localize("EH.Damage.Action.ApplyNegative"),
				icon: '<i class="fa-solid fa-user-plus"></i>',
				condition,
				callback: li => ChatMessageEH.applyDamage(li, -1)
			},
			{
				name: game.i18n.localize("EH.Damage.Action.ApplyDouble"),
				icon: '<i class="fa-solid fa-user-injured"></i>',
				condition,
				callback: li => ChatMessageEH.applyDamage(li, 2)
			},
			{
				name: game.i18n.localize("EH.Damage.Action.ApplyHalf"),
				icon: '<i class="fa-solid fa-user-shield"></i>',
				condition,
				callback: li => ChatMessageEH.applyDamage(li, 0.5)
			},
			{
				name: game.i18n.format("EH.Action.Roll", { type: game.i18n.localize("EH.Vehicle.Roll.DamageSave.Label") }),
				icon: '<i class="fa-solid fa-car-burst"></i>',
				condition: li => {
					const message = game.messages.get(li.data("messageId"));
					const tokens = canvas.tokens?.controlled.filter(t => t.actor?.type === "vehicle");
					return message?.isRoll && message?.isContentVisible && tokens?.length;
				},
				callback: ChatMessageEH.rollVehicleDamageSave
			},
			{
				name: game.i18n.localize("EH.Weapon.Action.SuppressiveFire.Place"),
				icon: '<i class="fa-solid fa-less-than"></i>',
				condition: li => {
					const message = game.messages.get(li.data("messageId"));
					return message?.isContentVisible && message?.flags["everyday-heroes"]?.suppressiveFire;
				},
				callback: ChatMessageEH.placeSuppressiveFireTemplate
			}
		);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Apply damage using the chat card buttons.
	 * @param {HTMLElement} li - The chat message entry's HTML.
	 * @param {number} multiplier - Damage multiplier.
	 * @returns {Promise}
	 */
	static async applyDamage(li, multiplier) {
		const message = game.messages.get(li.data("messageId"));
		const origin = foundry.utils.getProperty(message, "flags.everyday-heroes.roll.origin");
		const source = origin ? await fromUuid(origin) : null;
		const basePV = message?.rolls?.[0]?.options.pv ?? null;
		const damage = message?.rolls?.map(roll => ({
			value: roll.total,
			type: roll.options.type,
			pv: roll.options.pv === undefined ? basePV : roll.options.pv,
			source
		}));
		return Promise.all(canvas.tokens?.controlled
			.filter(t => t.actor?.system.attributes?.hp?.value !== undefined)
			.map(t => t.actor.applyDamage(damage, { multiplier }))
		);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Apply temp HP using the chat card buttons.
	 * @param {HTMLElement} li - The chat message entry's HTML.
	 * @returns {Promise}
	 */
	static applyTemp(li) {
		const message = game.messages.get(li.data("messageId"));
		const amount = message.rolls.reduce((a, r) => a + r.total, 0);
		return Promise.all(canvas.tokens?.controlled
			.filter(t => t.actor?.system.attributes?.hp?.temp !== undefined)
			.map(t => t.actor.applyTempHP(amount))
		);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Roll a damage save for any selected vehicles.
	 * @param {HTMLElement} li - The chat message entry's HTML.
	 */
	static async rollVehicleDamageSave(li) {
		const message = game.messages.get(li.data("messageId"));
		const amount = message.rolls.reduce((a, r) => a + r.total, 0);
		for ( const token of canvas.tokens?.controlled.filter(t => t.actor?.type === "vehicle") ?? [] ) {
			await token.actor.roll("vehicle-save", {
				ability: "con",
				options: { target: Math.floor(amount / 2) }
			});
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Place a template for a suppressive fire action.
	 * @param {HTMLElement} li - The chat message entry's HTML.
	 * @returns {Promise}
	 */
	static async placeSuppressiveFireTemplate(li) {
		const message = game.messages.get(li.data("messageId"));
		const flags = message.flags["everyday-heroes"]?.suppressiveFire ?? {};
		const { maxWidth, maxRange, origin: weapon } = flags;
		if ( !maxWidth || !maxRange || !canvas.tokens.controlled.length ) return;
		const templates = [];
		for ( const token of canvas.tokens.controlled ) {
			try {
				const template = await SuppressiveFireTemplate.create(token.document, {
					maxWidth, maxRange, templateData: { "flags.everyday-heroes": { weapon } }
				}).place();
				templates.push(template[0]);
			} catch(err) {
				if ( !(err instanceof SuppressiveFireTemplate.PlacementCanceledError) ) throw err;
			}
		}
		return templates;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Chat Action Events                       */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Apply listeners to the chat log.
	 * @param {ChatLog} app - The chat log being rendered.
	 * @param {HTMLElement|jQuery} html - Rendered chat log.
	 * @param {object} data - Data used to render the log.
	 */
	static attachChatListeners(app, html, data) {
		if ( game.release.generation < 13 ) {
			html.on("click", ".chat-actions button", ChatMessageEH._onChatAction.bind(this));
		} else {
			html.addEventListener("click", event => {
				if ( event.currentTarget.tagName === "BUTTON" && event.currentTarget.closest(".chat-actions") ) {
					ChatMessageEH._onChatAction(event);
				}
			});
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Handle clicks on chat card actions.
	 * @param {ClickEvent} event - Triggering click event.
	 * @returns {Promise}
	 */
	static async _onChatAction(event) {
		const message = game.messages.get(event.target.closest("[data-message-id]").dataset.messageId);
		const { action, type, data } = event.target.dataset;
		const config = JSON.parse(decodeURI(data ?? ""));
		config.event = event;
		const targets = message.getActionTargets();

		switch (action) {
			case "roll":
				for ( const token of targets ) {
					await token.actor.roll(type, config, {
						data: {
							speaker: ChatMessage.getSpeaker({scene: canvas.scene, token: token.document})
						},
						event
					});
				}
				return;
			default:
				return console.warn(`Everyday Heroes | Invalid chat action type clicked ${action}.`);
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Get the actors targeted by this chat message's actions.
	 * @returns {ActorEH[]} - Actors to target with an action.
	 */
	getActionTargets() {
		let targets = canvas.tokens.controlled.filter(t => !!t.actor);
		if ( !targets.length && game.user.character ) targets = game.user.character.getActiveTokens();
		return targets;
	}
}
