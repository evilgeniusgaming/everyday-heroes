import { numberFormat, simplifyBonus, systemLog } from "./utils.mjs";

const MAX_EMBED_DEPTH = 5;

const slugify = value => value?.slugify().replaceAll("-", "");

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
			pattern: /\[\[\/(?<type>check|damage|save|skill) (?<config>[^\]]+)]](?:{(?<label>[^}]+)})?/gi,
			enricher: enrichString
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
	const content = await fromUuid(uuid);
	if ( content ) return content.toAnchor({ name: label });

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
	config.format ??= "long";
	switch ( type.toLowerCase() ) {
		case "check":
			config.ability ??= config._;
			return enrichCheck(config, label, options);
		case "save":
			config.ability ??= config._;
			return enrichSave(config, label, options);
		case "skill":
			config.skill ??= config._;
			return enrichCheck(config, label, options);
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
	config._input = match[0];
	switch ( type.toLowerCase() ) {
		case "damage": return enrichDamage(config, label, options);
		case "check":
		case "skill": return enrichCheck(config, label, options);
		case "save": return enrichSave(config, label, options);
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
	const config = { _config: raw, values: [] };
	if ( !raw ) return config;
	const split = raw.split("|");
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
 * @param {string} match - Matched configuration string.
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
 * Add a dataset object to the provided element.
 * @param {HTMLElement} element - Element to modify.
 * @param {object} dataset - Data properties to add.
 * @private
 */
function _addDataset(element, dataset) {
	for ( const [key, value] of Object.entries(dataset) ) {
		if ( !["_config", "_input", "values"].includes(key) && ![null, undefined].includes(value) ) {
			element.dataset[key] = value;
		}
	}
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Create a passive skill tag.
 * @param {string} label - Label to display.
 * @param {object} dataset - Data that will be added to the tag.
 * @returns {HTMLElement}
 */
function createPassiveTag(label, dataset) {
	const span = document.createElement("span");
	span.classList.add("passive-check");
	_addDataset(span, dataset);
	span.innerText = label;
	return span;
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Create a label for a roll message.
 * @param {object} config - Enrichment configuration data.
 * @returns {string}
 */
function createRollLabel(config) {
	const ability = CONFIG.EverydayHeroes.abilities[config.ability]?.label;
	const skill = CONFIG.EverydayHeroes.skills[config.skill]?.label;
	const longSuffix = config.format === "long" ? "Long" : "Short";
	const showDC = config.dc && !config.hideDC;

	let label;
	switch ( config.type ) {
		case "ability-check":
		case "skill":
			if ( ability && skill ) {
				label = game.i18n.format("EH.Inline.SpecificCheck", { ability, type: skill });
			} else {
				label = ability;
			}
			if ( config.passive ) {
				label = game.i18n.format(`EH.Inline.DCPassive${longSuffix}`, { dc: config.dc, check: label });
			} else {
				if ( showDC ) label = game.i18n.format("EH.Inline.DC", { dc: config.dc, check: label });
				label = game.i18n.format(`EH.Inline.Check${longSuffix}`, { check: label });
			}
			break;
		case "ability-save":
			label = ability;
			if ( showDC ) label = game.i18n.format("EH.Inline.DC", { dc: config.dc, check: label });
			label = game.i18n.format(`EH.Inline.Save${longSuffix}`, { save: label });
			break;
		default:
			return "";
	}

	return label;
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Create a rollable link.
 * @param {string} label - Label to display.
 * @param {object} dataset - Data that will be added to the link for the rolling method.
 * @returns {HTMLElement}
 */
function createRollLink(label, dataset) {
	const span = document.createElement("span");
	span.classList.add("roll-link");
	_addDataset(span, dataset);

	// Add main link
	const link = document.createElement("a");
	link.dataset.action = "roll";
	link.innerHTML = `<i class="fa-solid fa-dice-d20"></i> ${label}`;
	span.insertAdjacentElement("afterbegin", link);

	// Add chat request link for GMs
	if ( game.user.isGM && (dataset.type !== "damage") ) {
		const gmLink = document.createElement("a");
		gmLink.dataset.action = "request";
		gmLink.dataset.tooltip = "EH.Inline.RequestRoll";
		gmLink.setAttribute("aria-label", game.i18n.localize(gmLink.dataset.tooltip));
		gmLink.innerHTML = '<i class="fa-solid fa-comment-dots"></i>';
		span.insertAdjacentElement("beforeend", gmLink);
	}

	return span;
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Check & Save Enrichers                   */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Enrich a ability check link to perform a specific ability or skill check.
 * @param {object} config - Configuration data.
 * @param {string} label - Optional label to replace default text.
 * @param {EnrichmentOptions} options - Options provided to customize text enrichment.
 * @returns {HTMLElement|null} - A HTML link if the check could be built, otherwise null.
 */
async function enrichCheck(config, label, options) {
	for ( let value of config.values ) {
		value = foundry.utils.getType(value) === "string" ? slugify(value) : value;
		if ( value in CONFIG.EverydayHeroes.enrichmentLookup.abilities ) config.ability = value;
		else if ( value in CONFIG.EverydayHeroes.enrichmentLookup.skills ) config.skill = value;
		else if ( Number.isNumeric(value) ) config.dc = Number(value);
		else config[value] = true;
	}

	let invalid = false;

	const skillConfig = CONFIG.EverydayHeroes.enrichmentLookup.skills[slugify(config.skill)];
	if ( config.skill && !skillConfig ) {
		systemLog(`Skill ${config.skill} not found while enriching ${config._input}.`, { level: "warn" });
		invalid = true;
	} else if ( config.skill && !config.ability ) {
		config.ability = skillConfig.ability;
	}
	if ( skillConfig?.key ) config.skill = skillConfig.key;

	let abilityConfig = CONFIG.EverydayHeroes.enrichmentLookup.abilities[slugify(config.ability)];
	if ( config.ability && !abilityConfig ) {
		systemLog(`Ability ${config.ability} not found while enriching ${config._input}.`, { level: "warn" });
		invalid = true;
	} else if ( !abilityConfig ) {
		systemLog(`No ability provided while enriching check ${config._input}.`, { level: "warn" });
		invalid = true;
	}
	if ( abilityConfig?.key ) config.ability = abilityConfig.key;

	if ( config.dc && !Number.isNumeric(config.dc) ) config.dc = simplifyBonus(config.dc, options.rollData ?? {});

	if ( invalid ) return null;

	const type = config.skill ? "skill" : "ability-check";
	config = { type, ...config };
	if ( !label ) label = createRollLabel(config);
	return config.passive ? createPassiveTag(label, config) : createRollLink(label, config);
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Enrich a ability save link.
 * @param {object} config - Configuration data.
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
	for ( const value of config.values ) {
		if ( value in CONFIG.EverydayHeroes.enrichmentLookup.abilities ) config.ability = value;
		else if ( Number.isNumeric(value) ) config.dc = Number(value);
		else config[value] = true;
	}

	const abilityConfig = CONFIG.EverydayHeroes.enrichmentLookup.abilities[config.ability];
	if ( !abilityConfig ) {
		systemLog(`Ability ${config.ability} not found while enriching ${config._input}.`, {level: "warn"});
		return null;
	}
	if ( abilityConfig?.key ) config.ability = abilityConfig.key;

	if ( config.dc && !Number.isNumeric(config.dc) ) config.dc = simplifyBonus(config.dc, options.rollData ?? {});

	config = { type: "ability-save", ...config };
	if ( !label ) label = createRollLabel(config);
	return createRollLink(label, config);
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Damage Enricher                          */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Enrich a damage link.
 * @param {object} config - Configuration data.
 * @param {string} [label] - Optional label to replace default text.
 * @param {EnrichmentOptions} options - Options provided to customize text enrichment.
 * @returns {HTMLElement|null} - An HTML link if the save could be built, otherwise null.
 */
async function enrichDamage(config, label, options) {
	const formulaParts = [];
	if ( config.formula ) formulaParts.push(config.formula);
	for ( const value of config.values ) {
		if ( value in CONFIG.EverydayHeroes.damageTypes ) config.type = value;
		else if ( value === "average" ) config.average = true;
		else formulaParts.push(value);
	}
	config.formula = Roll.defaultImplementation.replaceFormulaData(formulaParts.join(" "), options.rollData ?? {});
	if ( !config.formula ) return null;
	config.damageType = config.type;
	config.type = "damage";
	if ( (foundry.utils.getType(config.pv) === "string") && ["na", "n/a"].includes(config.pv?.toLowerCase()) ) {
		config.pv = false;
	}

	let pvLabel;
	if ( (config.pv === 0) || (config.pv > 0) ) pvLabel = "EH.Inline.DamagePV";
	else {
		if ( config.pv === false ) pvLabel = "EH.Inline.DamageIgnoringArmor";
		config.pv = null;
	}

	if ( label ) return createRollLink(label, config);

	const localizationData = {
		formula: createRollLink(config.formula, config).outerHTML,
		type: game.i18n.localize(CONFIG.EverydayHeroes.damageTypes[config.damageType]?.label ?? "").toLowerCase()
	};

	let localizationType = "Short";
	if ( config.average ) {
		localizationType = "Long";
		if ( config.average === true ) {
			const minRoll = Roll.create(config.formula).evaluate({ minimize: true, async: true });
			const maxRoll = Roll.create(config.formula).evaluate({ maximize: true, async: true });
			localizationData.average = Math.floor((await minRoll.total + await maxRoll.total) / 2);
		} else if ( Number.isNumeric(config.average) ) {
			localizationData.average = config.average;
		}
	}

	const span = document.createElement("span");
	span.classList.add("inline-damage");
	span.innerHTML = game.i18n.format(`EH.Inline.Damage${localizationType}`, localizationData);
	if ( pvLabel ) span.innerHTML = game.i18n.format(pvLabel, { damage: span.innerHTML, pv: numberFormat(config.pv) });

	return span;
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Embed Enricher                           */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Parse the enriched embed and provide the appropriate content.
 * Backported version from v12, to be removed when v11 support is dropped.
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

	config = foundry.utils.mergeObject({ cite: true, caption: true, inline: config.values.includes("inline") }, config);

	for ( const value of config.values ) {
		if ( config.uuid ) break;
		try {
			const parsed = foundry.utils.parseUuid(value);
			if ( parsed.documentId ) config.uuid = value;
		} catch(err) {}
	}

	config.doc = await fromUuid(config.uuid, { relative: options.relativeTo });
	// Special backported handling of journal pages
	if ( config.doc instanceof JournalEntryPage ) {
		switch ( config.doc.type ) {
			case "image": return embedImagePage(config, label, options);
			case "text": return embedTextPage(config, label, options);
		}
	}

	// Forward everything else to documents
	else if ( foundry.utils.getType(config.doc.toEmbed) === "function" ) {
		const doc = config.doc;
		delete config.doc;
		return doc.toEmbed({ ...config, label }, options);
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
async function rollAction(event) {
	const target = event.target.closest('.roll-link, [data-action="rollRequest"]');
	if ( !target ) return;
	event.stopPropagation();

	const { type, ability, skill, dc } = target.dataset;
	const config = { event };
	if ( ability ) config.ability = ability;
	if ( skill ) config.skill = skill;
	if ( dc ) config.options = { target: Number(dc) };

	const action = event.target.closest("a")?.dataset.action ?? "roll";

	// Direct roll
	if ( (action === "roll") || !game.user.isGM ) {
		target.disabled = true;
		try {
			// Fetch the actor that should perform the roll
			let actor;
			const speaker = ChatMessage.implementation.getSpeaker();
			if ( speaker.token ) actor = game.actors.tokens[speaker.token];
			actor ??= game.actors.get(speaker.actor);

			if ( type === "damage" ) return rollDamage(event, speaker);
			if ( !actor ) return ui.notifications.warn(game.i18n.localize("EH.Inline.NoActorWarning"));
			return actor.roll(type, config);
		} finally {
			target.disabled = false;
		}
	}

	// Roll request
	else {
		const MessageClass = getDocumentClass("ChatMessage");
		const chatData = {
			user: game.user.id,
			type: CONST.CHAT_MESSAGE_TYPES.OTHER,
			content: await renderTemplate("systems/everyday-heroes/templates/chat/request-card.hbs", {
				buttonLabel: createRollLabel({ ...target.dataset, format: "short", icon: true }),
				hiddenLabel: createRollLabel({ ...target.dataset, format: "short", icon: true, hideDC: true }),
				dataset: { ...target.dataset, action: "rollRequest" }
			}),
			flavor: game.i18n.localize("EH.Inline.RollRequest"),
			speaker: MessageClass.getSpeaker({ user: game.user })
		};
		return MessageClass.create(chatData);
	}
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Perform a damage roll.
 * @param {Event} event - The click event triggering the action.
 * @param {TokenDocument} [speaker] - Currently selected token, if one exists.
 * @returns {Promise|void}
 */
async function rollDamage(event, speaker) {
	const target = event.target.closest(".roll-link");
	const { formula, damageType: type, pv } = target.dataset;

	const rollConfigs = [{
		parts: [formula],
		data: {},
		event,
		options: { type, pv: pv ?? null }
	}];

	const flavor = game.i18n.format("EH.Action.Roll", {
		type: game.i18n.localize("EH.Weapon.Action.DamageGeneric.Label")
	});
	const messageConfig = {
		data: {
			title: flavor,
			flavor,
			speaker,
			"flags.everyday-heroes.roll.type": "damage"
		}
	};

	const dialogConfig = {
		options: {
			title: game.i18n.format("EH.Roll.Configuration.LabelSpecific", {
				type: game.i18n.format("EH.Weapon.Action.DamageGeneric.Label")
			})
		}
	};

	if ( Hooks.call("everydayHeroes.preRollDamage", undefined, rollConfigs, messageConfig,
		dialogConfig) === false ) return;

	const rolls = await CONFIG.Dice.DamageRoll.build(rollConfigs, messageConfig, dialogConfig);
	if ( !rolls ) return;

	Hooks.callAll("everydayHeroes.rollDamage", undefined, rolls);
}
