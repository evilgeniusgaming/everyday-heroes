/**
 * The Everyday Heroes game system for Foundry Virtual Tabletop.
 * Software License: MIT
 * Repository: https://github.com/evilgeniusgaming/everyday-heroes
 * Issue Tracker: https://github.com/evilgeniusgaming/everyday-heroes/issues
 */

import * as applications from "./code/applications/_module.mjs";
import * as canvas from "./code/canvas/_module.mjs";
import config from "./code/config/_module.mjs";
import * as data from "./code/data/_module.mjs";
import * as dice from "./code/dice/_module.mjs";
import * as documents from "./code/documents/_module.mjs";
import * as enrichers from "./code/enrichers.mjs";
import * as settings from "./code/settings.mjs";
import * as utils from "./code/utils.mjs";

globalThis.EverydayHeroes = {
	applications,
	canvas,
	config,
	data,
	dice,
	documents,
	enrichers,
	modules: {},
	settings,
	utils
};

Hooks.once("init", function() {
	utils.systemLog(`Initializing the Everyday Heroes Game System - Version ${game.system.version}\n${config.ASCII}`);

	game.everydayHeroes = globalThis.EverydayHeroes;
	CONFIG.EverydayHeroes = config;
	CONFIG.ui.combat = applications.CombatTrackerEH;
	canvas.registerCanvas();
	data.registerDataModels("Actor", data.actor.config);
	data.registerDataModels("Item", data.item.config);
	dice.registerDice();
	documents.registerDocumentClasses();
	enrichers.registerCustomEnrichers();
	settings.registerKeybindings();
	settings.registerSettings();
	utils.registerHandlebarsHelpers();
	utils.registerHandlebarsPartials();
});

Hooks.once("setup", function() {
	if ( game.release.generation > 10 ) applications.compendium.setupCompendiumApps();
	applications.registerSheets(Actor, config.actorCategories);
	applications.registerSheets(Item, config.itemCategories);
	settings.applyReduceTransparency();
});

Hooks.once("i18nInit", function() {
	config.utils.performPreLocalization(config);
	config.prepareTitanicSizes();
});

Hooks.once("ready", function() {
	if ( game.release.generation === 10 ) applications.compendium.setupLegacyCompendiumApps();
	config.registration.registerItemTypes();
});

Hooks.on("getChatLogEntryContext", documents.ChatMessageEH.getContextOptions);
Hooks.on("renderActorSheet", applications.renderDocumentSheet);
Hooks.on("renderChatLog", documents.ChatMessageEH.attachChatListeners);
Hooks.on("renderChatPopout", documents.ChatMessageEH.attachChatListeners);
Hooks.on("renderItemSheet", applications.renderDocumentSheet);
Hooks.on("renderJournalPageSheet", applications.journal.renderJournalPageSheet);
config.registration.setupRegistrationHooks();

export {
	applications,
	canvas,
	config,
	data,
	dice,
	documents,
	enrichers,
	settings,
	utils
};
