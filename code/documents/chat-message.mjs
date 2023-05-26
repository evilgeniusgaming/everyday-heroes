/**
 * Extended version of `ChatMessage` class to display crit highlighting and other system features.
 */
export default class ChatMessageEH extends ChatMessage {
	async getHTML() {
		const jQuery = await super.getHTML();
		if ( !this.isContentVisible ) return jQuery;

		await this._displayActions(jQuery[0]);
		if ( this.isRoll ) this._highlightRollResults(jQuery[0]);

		return jQuery;
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	async _renderRollContent(messageData) {
		await super._renderRollContent(messageData);

		// Display total damage for damage rolls
		if ( messageData.message.flags["everyday-heroes"]?.roll?.type === "damage" ) {
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
		const actions = this.getFlag("everyday-heroes", "actions");
		if ( !actions?.length ) return;
		const actionHTML = await renderTemplate("systems/everyday-heroes/templates/chat/card-actions.hbs", {
			message: this, actions
		});
		html.querySelector(".message-content")?.insertAdjacentHTML("beforeend", actionHTML);
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Add classes to roll results to indicate successes and failures.
	 * @param {HTMLElement} html - Chat message HTML.
	 */
	_highlightRollResults(html) {
		const rollResults = html.querySelectorAll(".dice-roll");
		for ( const [index, roll] of this.rolls.entries() ) {
			const result = rollResults[index];
			if ( !result ) continue;
			if ( roll.isCriticalSuccess ) result.classList.add("critical-success");
			else if ( roll.isCriticalFailure ) result.classList.add("critical-failure");
			else if ( roll.isSuccess ) result.classList.add("success");
			else if ( roll.isFailure ) result.classList.add("failure");
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
			return message?.isRoll && message?.isContentVisible && canvas.tokens?.controlled.length;
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
		const damage = message?.rolls?.map(roll => ({ value: roll.total, type: roll.options.type, source }));
		return Promise.all(canvas.tokens.controlled.map(t => t.actor.applyDamage(damage, { multiplier })));
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
		return Promise.all(canvas.tokens.controlled.map(t => t.actor.applyTempHP(amount)));
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Chat Action Events                       */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Apply listeners to the chat log.
	 * @param {ChatLog} app - The chat log being rendered.
	 * @param {jQuery} jQuery - Rendered chat log.
	 * @param {object} data - Data used to render the log.
	 */
	static attachChatListeners(app, jQuery, data) {
		jQuery.on("click", ".chat-actions button", ChatMessageEH._onChatAction.bind(this));
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
						}
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
