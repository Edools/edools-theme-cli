'use strict';

let gulp = require('gulp');
let $ = require('gulp-load-plugins')();
let config = require('../config');

gulp.task('copy:images', () => {
  return gulp.src(config.files.images)
    .pipe($.changed(config.paths.dist))
    .pipe(gulp.dest(config.paths.dist + '/' + config.paths.assets));
});

gulp.task('copy:liquid', () => {
  return gulp.src(config.files.liquid
    .concat(config.files.json), {base: '.'})
    .pipe($.changed(config.paths.dist))
    .pipe(gulp.dest(config.paths.dist));
});

