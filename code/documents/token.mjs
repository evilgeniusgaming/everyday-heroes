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
}
