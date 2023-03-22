/**
 * Determine compendium sections for concept items.
 * @param {object} document - Data for the entry being processed.
 * @returns {object}
 */
export function sortConcept(document) {
	switch (document.type) {
		case "specialFeature":
			if ( !document.system.type.value ) break;
			return { id: `${document.system.type.value}-special-features`, label: "EH.Item.Type.SpecialFeature[other]" };
		case "talent":
			if ( !document.system.type.value ) break;
			return { id: `${document.system.type.value}-talents`, label: "EH.Item.Type.Talent[other]" };
	}
	return { id: document.type, label: CONFIG?.Item.typeLabelsPlural?.[document.type] };
}
