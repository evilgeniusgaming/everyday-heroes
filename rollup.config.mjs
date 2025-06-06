import path from "path";
import postcss from "rollup-plugin-postcss";

export default {
	input: "code/_module.mjs",
	output: {
		file: "everyday-heroes.mjs",
		format: "es",
		sourcemap: true
	},
	plugins: [
		postcss({
			extract: path.resolve("everyday-heroes.css"),
			sourceMap: true
		})
	]
};
