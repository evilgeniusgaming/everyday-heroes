/**
 * The Everyday Heroes game system for Foundry Virtual Tabletop.
 * Software License: MIT
 * Repository: https://github.com/evilgeniusgaming/everyday-heroes
 * Issue Tracker: https://github.com/evilgeniusgaming/everyday-heroes/issues
 */

import "../styles/_module.css";

import * as applications from "./applications/_module.mjs";
import * as canvas from "./canvas/_module.mjs";
import config from "./config/_module.mjs";
import * as data from "./data/_module.mjs";
import * as dice from "./dice/_module.mjs";
import * as documents from "./documents/_module.mjs";
import * as enrichers from "./enrichers.mjs";
import * as settings from "./settings.mjs";
import * as utils from "./utils.mjs";

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

	CONFIG.compatibility.excludePatterns.push(/core\.sourceId/);
	CONFIG.compatibility.excludePatterns.push(/filePicker/);
	CONFIG.compatibility.excludePatterns.push(/select/);
	CONFIG.compatibility.excludePatterns.push(/hallengeDie/);
	CONFIG.compatibility.excludePatterns.push(/configureRoll/);
	CONFIG.compatibility.excludePatterns.push(/preprocessFormula/);
	CONFIG.compatibility.excludePatterns.push(/toMessage/);
	if (game.release.generation < 12) Math.clamp = Math.clamped;

	game.everydayHeroes = globalThis.EverydayHeroes;
	CONFIG.EverydayHeroes = config;
	CONFIG.ui.combat = applications.CombatTrackerEH;
	canvas.registerCanvas();
	data.fields.applyEffectApplicationPatches();
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
	applications.compendium.setupCompendiumApps();
	applications.registerSheets(Actor, config.actorCategories);
	applications.registerSheets(Item, config.itemCategories);

	DocumentSheetConfig.registerSheet(JournalEntry, game.system.id, applications.journal.JournalSheetEH, {
		makeDefault: true,
		label: "EH.Sheet.JournalEntry"
	});

	canvas.patchTokenHUD();
	config.utils.configureStatusEffects();
	settings.applyReduceTransparency();
});

Hooks.once("i18nInit", function() {
	config.utils.performPreLocalization(config);
	config.prepareTitanicSizes();
});

Hooks.once("ready", function() {
	config.registration.registerItemTypes();
	settings.enableTitanicSizes();
});

Hooks.on("getChatLogEntryContext", documents.ChatMessageEH.getContextOptions);
Hooks.on("renderActorSheet", applications.renderDocumentSheet);
Hooks.on("renderChatLog", documents.ChatMessageEH.attachChatListeners);
Hooks.on("renderChatPopout", documents.ChatMessageEH.attachChatListeners);
Hooks.on("renderItemSheet", applications.renderDocumentSheet);
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
