import gulp from "gulp";

import * as javascript from "./utils/javascript.mjs";
import * as packs from "./utils/packs.mjs";


// Javascript compiling & linting
export const buildJS = gulp.series(javascript.compile);
export const lint = gulp.series(javascript.lint);

// Compendium pack management
export const cleanPacks = gulp.series(packs.clean);
export const compilePacks = gulp.series(packs.compile);
export const extractPacks = gulp.series(packs.extract);

// Build all artifacts
export const buildAll = gulp.parallel(
  javascript.compile,
  packs.compile
);
