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
			}
		}

		return html;
	}
}
