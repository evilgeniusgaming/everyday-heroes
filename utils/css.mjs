import gulp from "gulp";
import concatCss from "gulp-concat-css";

/**
 * Compile the CSS source files into a single file.
 * @returns {*}
 */
function compileCSS() {
	return gulp.src("./everyday-heroes.css")
		.pipe(concatCss("./everyday-heroes-compiled.css"))
		.pipe(gulp.dest("./"));
}
export const compile = compileCSS;
