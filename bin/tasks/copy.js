'use strict';

let gulp = require('gulp');
let $ = require('gulp-load-plugins')();
let config = require('../config');
let merged = require('merge-stream');

gulp.task('copy', () => {
  return merged(
    gulp.src(config.files.images)
      .pipe($.changed(config.paths.dist))
      .pipe(gulp.dest(config.paths.dist + '/' + config.paths.assets)),

    gulp.src(config.files.liquid
      .concat(config.files.json), {base: '.'})
      .pipe($.changed(config.paths.dist))
      .pipe(gulp.dest(config.paths.dist))
  );
});

