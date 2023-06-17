import gulp from "gulp";

import * as javascript from "./utils/javascript.mjs";

// Javascript compiling & linting
export const lint = gulp.series(javascript.lint);
