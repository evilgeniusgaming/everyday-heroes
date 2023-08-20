/**
 * Extended version of `TokenLayer` class to handle Actors with multiple combat turns.
 */
export default class TokenLayerEH extends TokenLayer {
	async toggleCombat(state=true, combat=null, {token=null}={}) {
		if ( !state ) return super.toggleCombat(state, combat, {token});

		const tokens = this.controlled.filter(t => t.inCombat !== state);
		if ( token && !token.controlled && (token.inCombat !== state) ) tokens.push(token);

		combat = combat ?? game.combats.viewed;
		if ( !combat ) {
			if ( game.user.isGM ) {
				const cls = getDocumentClass("Combat");
				combat = await cls.create({scene: canvas.scene.id, active: true}, {render: !state || !tokens.length});
			} else {
				ui.notifications.warn("COMBAT.NoneActive", {localize: true});
				return [];
			}
		}

		const toCreate = tokens.reduce((arr, t) => {
			const turns = t.actor?.system.attributes?.initiative?.turns ?? 1;
			for ( const turn of Array.fromRange(turns) ) {
				arr.push({
					tokenId: t.id, sceneId: t.scene.id, actorId: t.document.actorId, hidden: t.document.hidden,
					"flags.everyday-heroes.turnNumber": turn
				});
			}
			return arr;
		}, []);
		return combat.createEmbeddedDocuments("Combatant", toCreate);
	}
}
