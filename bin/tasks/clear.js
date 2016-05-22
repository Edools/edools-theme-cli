'use strict';

let gulp = require('gulp');
let $ = require('gulp-load-plugins')();
let config = require('../config');

gulp.task('clean', () => {
  return gulp.src(config.files.liquid
    .concat(config.paths.dist))
    .pipe($.clean())
});
