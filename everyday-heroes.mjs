/**
 * The Everyday Heroes game system for Foundry Virtual Tabletop.
 * Software License: MIT
 * Repository: https://github.com/evilgeniusgaming/everyday-heroes
 * Issue Tracker: https://github.com/evilgeniusgaming/everyday-heroes/issues
 */

import * as applications from "./module/applications/_module.mjs";
import config from "./module/config/_module.mjs";
import * as data from "./module/data/_module.mjs";
import * as dice from "./module/dice/_module.mjs";
import * as documents from "./module/documents/_module.mjs";
import * as utils from "./module/utils.mjs";

globalThis.EverydayHeroes = {
	applications,
	config,
	data,
	dice,
	documents,
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
	utils.registerHandlebarsHelpers();
	utils.registerHandlebarsPartials();
});

Hooks.once("setup", function() {
	// Setup stuff here
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
	utils
};
