import { simplifyBonus, systemLog } from "./utils.mjs";

const MAX_EMBED_DEPTH = 5;

/**
 * Set up the custom text enricher.
 */
export function registerCustomEnrichers() {
	CONFIG.TextEditor.enrichers.push(
		{
			pattern: /@FallbackUUID\[(?<uuid>[^\]]+)\]{(?<label>[^}]+)}/g,
			enricher: enrichFallbackContentLink
		},
		{
			pattern: /@(?<type>Check|Save|Skill)\[(?<config>[^\]]+)\](?:{(?<label>[^}]+)})?/gi,
			enricher: enrichLegacyString
		},
		{
			// TODO: Remove when v11 support is dropped
			pattern: /@(?<type>Embed)\[(?<config>[^\]]+)](?:{(?<label>[^}]+)})?/gi,
			enricher: enrichString
		}
	);

	document.body.addEventListener("click", rollAction);
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Convert text of the form @FallbackUUID[uuid]{name} to anchor element, falling back to plain text
 * if the targeted content cannot be found.
 * @param {RegExpMatchArray} match - The regular expression match result.
 * @param {EnrichmentOptions} options - Options provided to customize text enrichment.
 * @returns {Promise<HTMLElement|null>} - An HTML element to insert in place of the matched text or null to
 *                                        indicate that no replacement should be made.
 */
async function enrichFallbackContentLink(match, options) {
	const { uuid, label } = match.groups;
	if ( fromUuidSync(uuid) ) return await TextEditor._createContentLink([null, "UUID", uuid, null, label], options);
	const span = document.createElement("span");
	span.innerText = label;
	span.classList.add("missing-link");
	return span;
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Parse the enriched string and provide the appropriate content.
 * @param {RegExpMatchArray} match - The regular expression match result.
 * @param {EnrichmentOptions} options - Options provided to customize text enrichment.
 * @returns {Promise<HTMLElement|null>} - An HTML element to insert in place of the matched text or null to
 *                                        indicate that no replacement should be made.
 */
async function enrichLegacyString(match, options) {
	let { type, config, label } = match.groups;
	config = prepareLegacyConfig(config);
	switch ( type.toLowerCase() ) {
		case "check": return enrichCheck(config, label, options);
		case "save": return enrichSave(config, label, options);
		case "skill": return enrichSkill(config, label, options);
	}
	return null;
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Parse the enriched string and provide the appropriate content.
 * @param {RegExpMatchArray} match - The regular expression match result.
 * @param {EnrichmentOptions} options - Options provided to customize text enrichment.
 * @returns {Promise<HTMLElement|null>} - An HTML element to insert in place of the matched text or null to
 *                                        indicate that no replacement should be made.
 */
async function enrichString(match, options) {
	let { type, config, label } = match.groups;
	config = prepareConfig(config);
	switch ( type.toLowerCase() ) {
		case "check": return enrichCheck(config, label, options);
		case "save": return enrichSave(config, label, options);
		case "skill": return enrichSkill(config, label, options);
		case "embed": return enrichEmbed(config, label, options);
	}
	return null;
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Format legacy configuration strings into a configuration object.
 * @param {string} raw - Raw configuration string.
 * @returns {object} - Configuration options formatted into an object.
 */
function prepareLegacyConfig(raw) {
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

/**
 * Format the provided configuration string into a configuration object.
 * @param {string} raw - Matched configuration string.
 * @returns {object} - Configuration options formatted into an object.
 */
function prepareConfig(match) {
	const config = { _config: match, values: [] };
	for ( const part of match.match(/(?:[^\s"]+|"[^"]*")+/g) ) {
		if ( !part ) continue;
		const [key, value] = part.split("=");
		const valueLower = value?.toLowerCase();
		if ( value === undefined ) config.values.push(key.replace(/(^"|"$)/g, ""));
		else if ( ["true", "false"].includes(valueLower) ) config[key] = valueLower === "true";
		else if ( Number.isNumeric(value) ) config[key] = Number(value);
		else config[key] = value.replace(/(^"|"$)/g, "");
	}
	return config;
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Element Creation                         */
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
function createRollLink(label, dataset) {
	const link = document.createElement("a");
	link.classList.add("roll-link");
	for ( const [key, value] of Object.entries(dataset) ) {
		if ( value ) link.dataset[key] = value;
	}
	link.innerHTML = `<i class="fa-solid fa-dice-d20"></i> ${label}`;
	return link;
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Check & Save Enrichers                   */
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
async function enrichCheck(config, label, options) {
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
async function enrichSave(config, label, options) {
	let { _: ability, dc } = config;
	dc = simplifyBonus(dc, options.rollData ?? {});

	const abilityConfig = CONFIG.EverydayHeroes.abilities[ability];
	if ( !abilityConfig ) return systemLog(`Ability ${ability} not found`, {color: "FireBrick"});

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
async function enrichSkill(config, label, options) {
	let { _: skill, dc } = config;
	dc = simplifyBonus(dc, options.rollData ?? {});

	const skillConfig = CONFIG.EverydayHeroes.skills[skill];
	if ( !skillConfig ) return systemLog(`Skill ${skill} not found`, {color: "FireBrick"});

	if ( !label ) {
		label = game.i18n.format("EH.Inline.Check", { ability: skillConfig.label });
		if ( dc ) label = game.i18n.format("EH.Inline.DC", { dc, check: label });
	}

	return createRollLink(label, { type: "skill", skill, dc });
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Embed Enricher                           */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Parse the enriched embed and provide the appropriate content.
 * @param {object} config - Configuration data.
 * @param {string} [label] - Optional label to replace default caption/text.
 * @param {EnrichmentOptions} options - Options provided to customize text enrichment.
 * @returns {HTMLElement|null} - An HTML link if the check could be built, otherwise null.
 */
async function enrichEmbed(config, label, options) {
	options._embedDepth ??= 0;
	if ( options._embedDepth > MAX_EMBED_DEPTH ) {
		console.warn(
			`Embed enrichers are restricted to ${MAX_EMBED_DEPTH} levels deep. ${config._input} cannot be enriched fully.`
		);
		return null;
	}

	for ( const value of config.values ) {
		if ( config.uuid ) break;
		try {
			const parsed = foundry.utils.parseUuid(value);
			if ( parsed.documentId ) config.uuid = value;
		} catch(err) {}
	}

	config.doc = await fromUuid(config.uuid, { relative: options.relativeTo });
	if ( config.doc instanceof JournalEntryPage ) {
		switch ( config.doc.type ) {
			case "image": return embedImagePage(config, label, options);
			case "text": return embedTextPage(config, label, options);
		}
	}
	return null;
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Embed an image page.
 * @param {object} config - Configuration data.
 * @param {string} [label] - Optional label to replace the default caption.
 * @param {EnrichmentOptions} options - Options provided to customize text enrichment.
 * @returns {HTMLElement|null} - An HTML figure containing the image, caption from the image page or a custom
 *                               caption, and a link to the source if it could be built, otherwise null.
 */
function embedImagePage(config, label, options) {
	const showCaption = config.caption !== false;
	const showCite = config.cite !== false;
	const caption = label || config.doc.image.caption || config.doc.name;

	const figure = document.createElement("figure");
	if ( config.classes ) figure.className = config.classes;
	figure.classList.add("content-embed");
	figure.innerHTML = `<img src="${config.doc.src}" alt="${config.alt || caption}">`;

	if ( showCaption || showCite ) {
		const figcaption = document.createElement("figcaption");
		if ( showCaption ) figcaption.innerHTML += `<strong class="embed-caption">${caption}</strong>`;
		if ( showCite ) figcaption.innerHTML += `<cite>${config.doc.toAnchor().outerHTML}</cite>`;
		figure.insertAdjacentElement("beforeend", figcaption);
	}
	return figure;
}

/* -------------------------------------------- */

/**
 * Embed a text page.
 * @param {object} config - Configuration data.
 * @param {string} [label] - Optional label to replace default text.
 * @param {EnrichmentOptions} options - Options provided to customize text enrichment.
 * @returns {HTMLElement|null} - An HTML element containing the content from the given page and a link to the
 *                               source if it could be built, otherwise null.
 */
async function embedTextPage(config, label, options) {
	options = { ...options, _embedDepth: options._embedDepth + 1, relativeTo: config.doc };
	config.inline ??= config.values.includes("inline");

	const enrichedPage = await TextEditor.enrichHTML(config.doc.text.content, options);
	if ( config.inline ) {
		const section = document.createElement("section");
		if ( config.classes ) section.className = config.classes;
		section.classList.add("content-embed");
		section.innerHTML = enrichedPage;
		return section;
	}

	const showCaption = config.caption !== false;
	const showCite = config.cite !== false;
	const caption = label || config.doc.name;
	const figure = document.createElement("figure");
	figure.innerHTML = enrichedPage;

	if ( config.classes ) figure.className = config.classes;
	figure.classList.add("content-embed");
	if ( showCaption || showCite ) {
		const figcaption = document.createElement("figcaption");
		if ( showCaption ) figcaption.innerHTML += `<strong class="embed-caption">${caption}</strong>`;
		if ( showCite ) figcaption.innerHTML += `<cite>${config.doc.toAnchor().outerHTML}</cite>`;
		figure.insertAdjacentElement("beforeend", figcaption);
	}

	return figure;
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Actions                                  */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Perform the provided roll action.
 * @param {Event} event - The click event triggering the action.
 * @returns {Promise|void}
 */
function rollAction(event) {
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
