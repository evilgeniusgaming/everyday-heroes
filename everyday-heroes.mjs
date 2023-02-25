/**
 * The Everyday Heroes game system for Foundry Virtual Tabletop.
 * Software License: MIT
 * Repository: https://github.com/evilgeniusgaming/everyday-heroes
 * Issue Tracker: https://github.com/evilgeniusgaming/everyday-heroes/issues
 */

import * as applications from "./module/applications/_module.mjs";
import config from "./module/config/_module.mjs";
import * as data from "./module/data/_module.mjs";
import * as documents from "./module/documents/_module.mjs";
import * as utils from "./module/utils.mjs";

globalThis.EverydayHeroes = {
	applications,
	config,
	data,
	documents,
	utils
};

Hooks.once("init", function() {
	game.everydayHeroes = globalThis.EverydayHeroes;
	console.log(`Everyday Heroes | Initializing the Everyday Heroes Game System - Version ${game.system.version}`);

	CONFIG.EverydayHeroes = config;

	CONFIG.Actor.documentClass = documents.ActorEH;
	CONFIG.Actor.systemDataModels = data.actor.config;
	CONFIG.Actor.typeLabels = {
		character: "EH.Actor.Types.Character[one]",
		npc: "EH.Actor.Types.NPC[one]"
	};
	DocumentSheetConfig.registerSheet(Actor, "everyday-heroes", applications.actor.CharacterSheetEH, {
		types: ["character"],
		makeDefault: true,
		label: "EH.Sheets.Character"
	});

	CONFIG.Item.documentClass = documents.ItemEH;
	CONFIG.Item.systemDataModels = data.item.config;
	CONFIG.Item.typeLabels = {
		archetype: "EH.Item.Types.Archetype[one]",
		background: "EH.Item.Types.Background[one]",
		class: "EH.Item.Types.Class[one]",
		profession: "EH.Item.Types.Profession[one]"
	};

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
	documents,
	utils
};
