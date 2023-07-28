/**
 * Data model template for actors that have conditions.
 * @mixin
 */
export default class ConditionsTemplate {

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Data Preparation                         */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	prepareEmbeddedConditions() {
		this.conditions = {};
		for ( const effect of this.parent.effects ) {
			const { id, level } = effect.conditionDetails ?? {};
			if ( !id ) continue;
			this.conditions[id] = Math.max(this.conditions[id] ?? 0, level ?? 1);
		}
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
	/*  Helpers                                  */
	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	/**
	 * Set a condition to a level or remove it.
	 * @param {string} condition - Identifier for the condition to modify.
	 * @param {number} [level] - New level to set, or blank to remove the condition.
	 * @returns {Promise}
	 */
	async setConditionLevel(condition, level) {
		if ( this.conditions[condition] === level ) return;

		const effects = this.parent.effects.filter(e => e.conditionDetails?.id === condition);
		const toDelete = [];

		// No level, remove all associated effects
		if ( !level ) effects.forEach(e => toDelete.push(e.id));

		// Lower level, remove any unnecessary effects
		else if ( level < this.conditions[condition] ) effects.forEach(e =>
			e.conditionDetails.level > level ? toDelete.push(e.id) : null);

		// Higher level, add any required effects
		else {
			const conditionData = CONFIG.EverydayHeroes.registration.get("condition", condition);
			if ( !conditionData ) console.warn(`Condition ${condition} not registered.`);
			const conditionItem = await fromUuid(conditionData.sources[0]);
			const toAdd = conditionItem.system.levels.slice(this.conditions[condition] ?? 0, level).map(e => e.effect);
			const icon = CONFIG.EverydayHeroes.conditions[condition]?.icon;
			await this.parent.createEmbeddedDocuments("ActiveEffect", toAdd.map(e => {
				const obj = e.toObject();
				if ( foundry.utils.hasProperty(obj, "flags.core.statusId") ) delete obj.flags.core.statusId;
				if ( icon ) obj.icon = icon;
				return obj;
			}));
		}

		if ( toDelete.length ) await this.parent.deleteEmbeddedDocuments("ActiveEffect", toDelete);
	}
}
