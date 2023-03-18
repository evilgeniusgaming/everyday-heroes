/**
 * The Everyday Heroes game system for Foundry Virtual Tabletop.
 * Software License: MIT
 * Repository: https://github.com/evilgeniusgaming/everyday-heroes
 * Issue Tracker: https://github.com/evilgeniusgaming/everyday-heroes/issues
 */

import * as applications from "./code/applications/_module.mjs";
import config from "./code/config/_module.mjs";
import * as data from "./code/data/_module.mjs";
import * as dice from "./code/dice/_module.mjs";
import * as documents from "./code/documents/_module.mjs";
import * as enrichers from "./code/enrichers.mjs";
import * as settings from "./code/settings.mjs";
import * as utils from "./code/utils.mjs";

globalThis.EverydayHeroes = {
	applications,
	config,
	data,
	dice,
	documents,
	enrichers,
	settings,
	utils
};

Hooks.once("init", function() {
	console.log(`Everyday Heroes | Initializing the Everyday Heroes Game System - Version ${game.system.version}`);
	game.everydayHeroes = globalThis.EverydayHeroes;
	CONFIG.EverydayHeroes = config;
	applications.registerSheets();
	data.registerSystemDataModels();
	dice.registerDice();
	documents.registerDocumentClasses();
	enrichers.registerCustomEnrichers();
	settings.registerKeybindings();
	settings.registerSettings();
	utils.registerHandlebarsHelpers();
	utils.registerHandlebarsPartials();
});

Hooks.once("setup", function() {
	settings.applyReduceTransparency();
});

Hooks.once("i18nInit", function() {
	config.utils.performPreLocalization(config);
});

Hooks.once("ready", function() {
	// Perform global migrations here if necessary
});

export {
	applications,
	config,
	data,
	dice,
	documents,
	enrichers,
	settings,
	utils
};
