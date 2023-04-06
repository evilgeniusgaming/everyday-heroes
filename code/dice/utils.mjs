import { simplifyBonus } from "../utils.mjs";

/**
 * Determine which keys are pressed that might trigger the provided keybinding.
 * @param {Event} event - Triggering event.
 * @param {string} action - Keybinding action within the `everyday-heroes` namespace.
 * @returns {boolean} - Should this action be triggered?
 */
export function areKeysPressed(event, action) {
	if ( !event ) return false;
	const activeModifiers = {
		[KeyboardManager.MODIFIER_KEYS.CONTROL]: event.ctrlKey || event.metaKey,
		[KeyboardManager.MODIFIER_KEYS.SHIFT]: event.shiftKey,
		[KeyboardManager.MODIFIER_KEYS.ALT]: event.altKey
	};
	return game.keybindings.get("everyday-heroes", action).some(b => {
		if ( !game.keyboard.downKeys.has(b.key) ) return false;
		return b.modifiers.every(m => activeModifiers[m]);
	});
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Take the provided minimum formulas and find the largest.
 * @param {object} formulas - Minimum formulas to consider.
 * @param {object} data - Roll data to use while resolving the formulas.
 * @returns {number|void}
 */
export function buildMinimum(formulas, data) {
	let minimum = -Infinity;
	for ( const formula of formulas ) {
		const resolved = simplifyBonus(formula, data);
		if ( !Number.isNumeric(resolved) || resolved < minimum ) continue;
		minimum = resolved;
	}
	if ( minimum > -Infinity ) return minimum;
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Construct roll parts and populate its data object.
 * @param {object} parts - Information on the parts to be constructed.
 * @param {object} data - Roll data to use and populate while constructing the parts.
 * @returns {{ parts: string[], data: object }}
 */
export function buildRoll(parts, data) {
	const finalParts = [];
	for ( let [key, value] of Object.entries(parts) ) {
		if ( !value && (value !== 0) ) continue;
		finalParts.push(`@${key}`);
		foundry.utils.setProperty(data, key, foundry.utils.getType(value) === "string"
			? Roll.replaceFormulaData(value, data) : value);
	}
	return { parts: finalParts, data };
}

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Step the provided die denomination up or down based on the provided step, clamping to the ends.
 * @param {number} denomination - Starting denomination to step.
 * @param {number} step - How many steps up or down the denomination should be moved.
 * @returns {number|null} - New denomination.
 */
export function stepDenomination(denomination, step) {
	return CONFIG.EverydayHeroes.diceSteps[Math.min(
		CONFIG.EverydayHeroes.diceSteps.indexOf(denomination) + (step ?? 0),
		CONFIG.EverydayHeroes.diceSteps.length - 1
	)] ?? null;
}
