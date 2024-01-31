import { systemLog } from "./utils.mjs";

const requireTitanicScale = () => game.modules.map(m =>
	m.flags?.["everyday-heroes"]?.requireTitanicScale ?? false
).some(b => b);

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Register custom keybindings offered by Everyday Heroes.
 */
export function registerKeybindings() {
	systemLog("Registering Keybindings");

	game.keybindings.register("everyday-heroes", "challengeRollNormal", {
		name: "EH.Keybinding.ChallengeRoll.Normal.Label",
		editable: [
			{ key: "ShiftLeft" },
			{ key: "ShiftRight" }
		]
	});

	game.keybindings.register("everyday-heroes", "challengeRollAdvantage", {
		name: "EH.Keybinding.ChallengeRoll.Advantage.Label",
		editable: [
			{ key: "AltLeft" },
			{ key: "AltRight" }
		]
	});

	game.keybindings.register("everyday-heroes", "challengeRollDisadvantage", {
		name: "EH.Keybinding.ChallengeRoll.Disadvantage.Label",
		editable: [
			{ key: "CtrlLeft" },
			{ key: "CtrlRight" },
			{ key: "OSLeft" },
			{ key: "OSRight" }
		]
	});

	game.keybindings.register("everyday-heroes", "damageRollNormal", {
		name: "EH.Keybinding.DamageRoll.Normal.Label",
		editable: [
			{ key: "ShiftLeft" },
			{ key: "ShiftRight" },
			{ key: "CtrlLeft" },
			{ key: "CtrlRight" },
			{ key: "OSLeft" },
			{ key: "OSRight" }
		]
	});

	game.keybindings.register("everyday-heroes", "damageRollCritical", {
		name: "EH.Keybinding.DamageRoll.Critical.Label",
		editable: [
			{ key: "AltLeft" },
			{ key: "AltRight" }
		]
	});
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Register the settings offered by Everyday Heroes.
 */
export function registerSettings() {
	systemLog("Registering Settings");

	game.settings.register("everyday-heroes", "systemMigrationVersion", {
		name: "System Migration Version",
		scope: "world",
		config: false,
		type: String,
		default: ""
	});

	// Challenge visibility
	game.settings.register("everyday-heroes", "challengeVisibility", {
		name: "EH.Settings.ChallengeVisibility.Name",
		hint: "EH.Settings.ChallengeVisibility.Hint",
		scope: "world",
		config: true,
		default: "player",
		type: String,
		choices: {
			all: "EH.Settings.ChallengeVisibility.All",
			player: "EH.Settings.ChallengeVisibility.Player",
			none: "EH.Settings.ChallengeVisibility.None"
		}
	});

	// Add tiebreaker to initiative rolls
	game.settings.register("everyday-heroes", "initiativeTiebreaker", {
		name: "EH.Settings.InitiativeTiebreaker.Label",
		hint: "EH.Settings.InitiativeTiebreaker.Hint",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});

	// Enable titanic sizes
	const required = requireTitanicScale();
	game.settings.register("everyday-heroes", "titanicSizes", {
		name: "EH.Settings.TitanicSizes.Label",
		hint: "EH.Settings.TitanicSizes.Hint",
		scope: "world",
		config: !required,
		default: required,
		type: Boolean,
		requiresReload: true
	});

	// Reduce Transparency Accessibility Toggle
	game.settings.register("everyday-heroes", "reduceTransparency", {
		name: "EH.Settings.ReduceTransparency.Label",
		hint: "EH.Settings.ReduceTransparency.Hint",
		scope: "client",
		config: true,
		default: false,
		type: Boolean,
		onChange: applyReduceTransparency
	});

	// Last created types
	game.settings.register("everyday-heroes", "_lastCreateTypeItem", {
		scope: "client",
		config: false,
		default: null,
		type: String
	});
	game.settings.register("everyday-heroes", "_lastCreateTypeActor", {
		scope: "client",
		config: false,
		default: null,
		type: String
	});
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Apply or remove the reduce transparency style to the body.
 * @param {boolean} reduceTransparency - Value of the reduce transparency setting.
 */
export function applyReduceTransparency(reduceTransparency) {
	reduceTransparency ??= game.settings.get("everyday-heroes", "reduceTransparency");
	const body = document.querySelector("body");
	if ( reduceTransparency ) body.classList.add("reduce-transparency");
	else body.classList.remove("reduce-transparency");
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Ensure titanic sizes are enabled if required.
 */
export async function enableTitanicSizes() {
	if ( !game.user.isGM || !requireTitanicScale() || game.settings.get("everyday-heroes", "titanicSizes") ) return;
	await game.settings.set("everyday-heroes", "titanicSizes", true);
	game.socket.emit("reload");
	foundry.utils.debouncedReload();
}
