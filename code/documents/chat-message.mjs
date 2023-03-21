/**
 * Extended version of `ChatMessage` class to display crit highlighting and other system features.
 */
export default class ChatMessageEH extends ChatMessage {
	async getHTML() {
		const html = await super.getHTML();

		if ( this.isRoll && this.isContentVisible ) {
			const rollResults = html[0].querySelectorAll(".dice-roll");
			for ( const [index, roll] of this.rolls.entries() ) {
				const result = rollResults[index];
				if ( !result ) continue;
				if ( roll.isCriticalSuccess ) result.classList.add("critical-success");
				else if ( roll.isCriticalFailure ) result.classList.add("critical-failure");
				else if ( roll.isSuccess ) result.classList.add("success");
				else if ( roll.isFailure ) result.classList.add("failure");
			}
		}

		return html;
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
}
