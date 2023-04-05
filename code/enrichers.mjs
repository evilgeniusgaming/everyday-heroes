import { simplifyBonus } from "./utils.mjs";

/**
 * Set up the custom text enricher.
 */
export function registerCustomEnrichers() {
	CONFIG.TextEditor.enrichers.push({
		pattern: /@(?<type>Check|Save|Skill)\[(?<config>[^\]]+)\](?:{(?<label>[^}]+)})?/g,
		enricher: enrichString
	});

	document.querySelector("body").addEventListener("click", rollAction);
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Parse the enriched string and provide the appropriate content.
 * @param {RegExpMatchArray} match - The regular expression match result.
 * @param {EnrichmentOptions} options - Options provided to customize text enrichment.
 * @returns {Promise<HTMLElement|null>} - An HTML element to insert in place of the matched text or null to
 *                                        indicate that no replacement should be made.
 */
export async function enrichString(match, options) {
	let { type, config, label } = match.groups;
	config = prepareConfig(config);
	switch (type) {
		case "Check": return enrichCheck(config, label, options);
		case "Save": return enrichSave(config, label, options);
		case "Skill": return enrichSkill(config, label, options);
	}
	return null;
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Format the provided configuration string into a configuration object.
 * @param {string} raw - Raw configuration string.
 * @returns {object} - Configuration options formatted into an object.
 */
function prepareConfig(raw) {
	if ( !raw ) return {};
	const split = raw.split("|");
	const config = {};
	if ( !split[0].includes(":") ) config._ = split.shift();
	for ( const option of split ) {
		let [key, value] = option.split(":");
		if ( !value ) value = true;
		config[key] = value;
	}
	return config;
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Enrichers                                */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * @typedef {object} EnrichCheckConfig
 * @property {string} _ - Check to be performed (e.g. `con`, `dex`).
 * @property {string} [skill] - Skill to use for the check (e.g. `acro`, `dece`).
 * @property {string} [dc] - Target DC for the check.
 */

/**
 * Enrich a ability check link to perform a specific ability or skill check.
 * @param {EnrichCheckConfig} config - Configuration data.
 * @param {string} label - Optional label to replace default text.
 * @param {EnrichmentOptions} options - Options provided to customize text enrichment.
 * @returns {HTMLElement|null} - A HTML link if the check could be built, otherwise null.
 *
 * TODO: Add some examples
 */
export async function enrichCheck(config, label, options) {
	let { _: ability, skill, dc } = config;
	dc = simplifyBonus(dc, options.rollData ?? {});

	const abilityConfig = CONFIG.EverydayHeroes.abilities[ability];
	if ( !abilityConfig ) return console.warn(`Everyday Heroes | Ability ${ability} not found`);

	const skillConfig = CONFIG.EverydayHeroes.skills[skill];
	if ( (skill !== undefined) && !skillConfig ) return console.warn(`Everyday Heroes | Skill ${skill} not found`);

	// Insert the icon and label into the link
	if ( !label ) {
		if ( skill ) label = game.i18n.format("EH.Inline.Skill", { ability: abilityConfig.label, skill: skillConfig.label });
		else label = game.i18n.format("EH.Inline.Check", { ability: abilityConfig.label });
		if ( dc ) label = game.i18n.format("EH.Inline.DC", { dc, check: label });
	}

	const type = skillConfig ? "skill" : "ability-check";
	return createRollLink(label, { type, ability, skill, dc });
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * @typedef {object} EnrichSaveConfig
 * @property {string} _ - Save to be performed (e.g. `con`, `dex`).
 * @property {string} [dc] - Target DC for the save.
 */

/**
 * Enrich a ability save link.
 * @param {EnrichSaveConfig} config - Configuration data.
 * @param {string} label - Optional label to replace default text.
 * @param {EnrichmentOptions} options - Options provided to customize text enrichment.
 * @returns {HTMLElement|null} - A HTML link if the save could be built, otherwise null.
 *
 * @example Create a dexterity saving throw:
 * ```@Save{dex}```
 * becomes
 * ```html
 * <a class="roll-action" data-type="save" data-ability="dex">
 *   <i class="fa-solid fa-dice-d20"></i> Dexterity Save
 * </a>
 * ```
 *
 * @example Add a DC to the save:
 * ```@Save{dex|dc:20}```
 * becomes
 * ```html
 * <a class="roll-action" data-type="save" data-ability="dex" data-dc="20">
 *   <i class="fa-solid fa-dice-d20"></i> DC 20 Dexterity Save
 * </a>
 * ```
 */
export async function enrichSave(config, label, options) {
	let { _: ability, dc } = config;
	console.log(dc, options.rollData);
	dc = simplifyBonus(dc, options.rollData ?? {});

	const abilityConfig = CONFIG.EverydayHeroes.abilities[ability];
	if ( !abilityConfig ) return console.log(`Everyday Heroes | Ability ${ability} not found`);

	if ( !label ) {
		label = game.i18n.format("EH.Inline.Save", { ability: abilityConfig.label });
		if ( dc ) label = game.i18n.format("EH.Inline.DC", { dc, check: label });
	}

	return createRollLink(label, { type: "ability-save", ability, dc });
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * @typedef {object} EnrichSkillConfig
 * @property {string} _ - Skill check to be performed (e.g. `acro`, `dece`).
 * @property {string} [dc] - Target DC for the skill check.
 */

/**
 * Enrich a skill check link. Unlike the `@Check` enricher, this will use the player's default ability
 * or allow for selecting any associated ability to perform the skill check.
 * @param {EnrichSkillConfig} config - Configuration data.
 * @param {string} label - Optional label to replace default text.
 * @param {EnrichmentOptions} options - Options provided to customize text enrichment.
 * @returns {HTMLElement|null} - A HTML link if the save could be built, otherwise null.
 *
 * TODO: Add some examples
 */
export async function enrichSkill(config, label, options) {
	let { _: skill, dc } = config;
	dc = simplifyBonus(dc, options.rollData ?? {});

	const skillConfig = CONFIG.EverydayHeroes.skills[skill];
	if ( !skillConfig ) return console.log(`Everyday Heros | Skill ${skill} not found`);

	if ( !label ) {
		label = game.i18n.format("EH.Inline.Check", { ability: skillConfig.label });
		if ( dc ) label = game.i18n.format("EH.Inline.DC", { dc, check: label });
	}

	return createRollLink(label, { type: "skill", skill, dc });
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Create a rollable link.
 * @param {string} label - Label to display.
 * @param {object} dataset
 * @param {string} dataset.type - Type of rolling action to perform (e.g. `check`, `save`, `skill`).
 * @param {string} dataset.ability - Ability key to roll (e.g. `dex`, `str`).
 * @param {string} dataset.skill - Skill key to roll (e.g. `acro`, `dece`).
 * @param {number} dataset.dc - DC of the roll.
 * @returns {HTMLElement}
 */
export function createRollLink(label, dataset) {
	const link = document.createElement("a");
	link.classList.add("roll-link");
	for ( const [key, value] of Object.entries(dataset) ) {
		if ( value ) link.dataset[key] = value;
	}
	link.innerHTML = `<i class="fa-solid fa-dice-d20"></i> ${label}`;
	return link;
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Actions                                  */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Perform the provided roll action.
 * @param {Event} event - The click event triggering the action.
 * @returns {Promise|void}
 */
export function rollAction(event) {
	let target = event.target;
	if ( !target.classList.contains("roll-link") ) target = target.closest(".roll-link");
	if ( !target ) return;
	event.stopPropagation();

	const { type, ability, skill, dc } = target.dataset;
	const config = {};
	if ( ability ) config.ability = ability;
	if ( skill ) config.skill = skill;
	if ( dc ) config.options = { target: Number(dc) };

	// Fetch the actor that should perform the roll
	let actor;
	const speaker = ChatMessage.getSpeaker();
	if ( speaker.token ) actor = game.actors.tokens[speaker.token];
	actor ??= game.actors.get(speaker.actor);
	if ( !actor ) return ui.notifications.warn(game.i18n.localize("EH.Inline.NoActorWarning"));

	return actor.roll(type, config);
}
