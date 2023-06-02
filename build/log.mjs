import Chalk from "chalk";

/**
 * Log the provided message with a timestamp.
 * @param {string} message
 */
export default function log(message) {
	const timestamp = (new Date()).toLocaleTimeString("en", { hour12: false });
	console.log(`[${Chalk.yellow(timestamp)}] ${message}`);
}
