/**
 * Register custom keybindings offered by Everyday Heroes.
 */
export function registerKeybindings() {
	console.log("Everyday Heroes | Registering Keybindings");
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Register the settings offered by Everyday Heroes.
 */
export function registerSettings() {
	console.log("Everyday Heroes | Registering Settings");

	game.settings.register("everyday-heroes", "systemMigrationVersion", {
		name: "System Migration Version",
		scope: "world",
		config: false,
		type: String,
		default: ""
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
