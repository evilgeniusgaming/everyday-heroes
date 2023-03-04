/**
 * Step the provided die denomination up or down based on the provided step, clamping to the ends.
 * @param {number} denomination - Starting denomination to step.
 * @param {number} step - How many steps up or down the denomination should be moved.
 * @returns {number} - New denomination.
 */
export function stepDenomination(denomination, step) {
	return CONFIG.EverydayHeroes.diceSteps[Math.clamped(
		0,
		CONFIG.EverydayHeroes.diceSteps.indexOf(denomination) + (step ?? 0),
		CONFIG.EverydayHeroes.diceSteps.length - 1
	)];
}
