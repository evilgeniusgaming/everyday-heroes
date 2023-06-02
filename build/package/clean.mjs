/**
 * Removes unwanted flags, permissions, and other data from entries before extracting or compiling.
 * @param {object} data - Data for a single entry to clean.
 * @param {object} [options]
 * @param {string} [options.documentType] - Type of document being cleaned.
 * @param {boolean} [options.clearSourceId] - Should the core sourceId flag be deleted.
 */
export function cleanPackEntry(data, { documentType, clearSourceId=true }={}) {
	if ( data.ownership ) data.ownership = { default: 0 };
	if ( data._stats?.lastModifiedBy ) data._stats.lastModifiedBy = "everyday00heroes";

	// Remove empty entries in flags
	if ( !data.flags ) data.flags = {};
	Object.entries(data.flags).forEach(([key, contents]) => {
		if ( Object.keys(contents).length === 0 ) delete data.flags[key];
	});

	if ( clearSourceId ) delete data.flags?.core?.sourceId;
	delete data.flags?.importSource;
	delete data.flags?.exportSource;

	if ( data.system?.description?.value ) data.system.description.value = cleanString(data.system.description.value);
	if ( data.label ) data.label = cleanString(data.label);
	if ( data.name ) data.name = cleanString(data.name);
	data.sort = 0;

	if ( data.effects ) data.effects.forEach(i => cleanPackEntry(i, { documentType: "ActiveEffect", clearSourceId: false }));
	if ( data.items ) data.items.forEach(i => cleanPackEntry(i, { documentType: "Item", clearSourceId: false }));
}

/**
 * Removes invisible whitespace characters.
 * @param {string} str - The string to be cleaned.
 * @returns {string} - The cleaned string.
 */
function cleanString(str) {
	return str.replace(/\u2060/gu, "");
}
