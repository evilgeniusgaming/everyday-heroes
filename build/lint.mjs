import { ESLint } from "eslint";
import * as logger from "./log.mjs";

const _plurals = {
	error: { one: "error", other: "errors" },
	problem: { one: "problem", other: "problem" },
	warning: { one: "warning", other: "warnings" }
};

/**
 * Get the command object for the lint command.
 * @returns {{handler: ((function(*): Promise<void>|*), builder: builder, describe, string, command, string}}
 */
export default function getCommand() {
	let currentPackageId = "everyday-heroes";
	let currentPackageType = "system";

	return {
		command: "lint",
		description: "Lint Javascript",
		builder: yargs => {
			yargs.options("id", {
				describe: "The package ID.",
				type: "string"
			});

			yargs.options("fix", {
				describe: "Whether issues should be automatically fixed if possible.",
				type: "boolean"
			});
		},
		handler: async argv => {
			if ( argv.id ) {
				currentPackageId = argv.id;
			}

			_handleLint(argv.fix);
		}
	};

	/**
	 * Execute linting on the javascript files, fixing if necessary.
	 * @property {boolean} fix - Should issues be fixed automatically if possible?
	 * @private
	 */
	async function _handleLint(fix) {
		const options = {};
		const eslint = new ESLint(options);
		const results = await eslint.lintFiles("./everyday-heroes.mjs");
		for ( const result of results ) {
			_formatResult(result);
		}
		// console.log(result);
	}

	function _formatResult(result) {
		const problemCount = result.errorCount + result.fatalErrorCount + result.warningCount;
		const fixableCount = result.fixableErrorCount + result.fixableWarningCount;
		logger.log(result.filePath, {underline: true});
		if ( result.fatalErrorCount ) {
			logger.error(
				`${result.fatalErrorCount} fatal ${_("error", result.fatalErrorCount)}, could not continue linting`
			);
		} else if ( result.problemCount ) {
			logger.warn(
				`${problemCount} ${_("problem", problemCount)} (${
					result.errorCount} ${_("error", result.errorCount)}, ${
					result.warningCount} ${_("warning", result.warningCount)})`
			);
		} else {
			logger.log("No issues encountered", {color: "green"});
		}
	}

	function _(word, count) {
		const rule = count === 1 ? "one" : "other";
		return _plurals[word]?.[rule] ?? word;
	}
}

// 
// /**
//  * Parsed arguments passed in through the command line.
//  * @type {object}
//  */
// const parsedArgs = yargs(process.argv).argv;
// 
// /**
//  * Paths of javascript files that should be linted.
//  * @type {string[]}
//  */
// const LINTING_PATHS = ["./everyday-heroes.mjs", "./code/"];
// 
// /**
//  * Lint javascript sources and optionally applies fixes.
//  * @returns {*}
//  *
//  * - `gulp lint` - Lint all javascript files.
//  * - `gulp lint --fix` - Lint and apply available fixes automatically.
//  */
// function lintJavascript() {
// 	const applyFixes = !!parsedArgs.fix;
// 	const tasks = LINTING_PATHS.map(path => {
// 		const src = path.endsWith("/") ? `${path}**/*.mjs` : path;
// 		const dest = path.endsWith("/") ? path : `${path.split("/").slice(0, -1).join("/")}/`;
// 		return gulp
// 			.src(src)
// 			.pipe(eslint({fix: applyFixes}))
// 			.pipe(eslint.format())
// 			.pipe(gulpIf(file => file.eslint != null && file.eslint.fixed, gulp.dest(dest)));
// 	});
// 	return mergeStream(tasks);
// }
// export const lint = lintJavascript;
