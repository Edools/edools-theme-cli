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
    .concat(config.files.json)
    .concat(config.files.fonts), {base: '.'})
    .pipe($.changed(config.paths.dist))
    .pipe(gulp.dest(config.paths.dist));
});


gulp.task('copy:css', () => {
  return gulp.src([
    config.files.css,
    '!' + config.paths.assets + 'compiled/**.*.*'
  ])
    .pipe($.changed(config.paths.dist + '/' + config.paths.assets))
    .pipe(gulp.dest(config.paths.dist + '/' + config.paths.assets));
});

gulp.task('copy:minJs', () => {
  return gulp.src([
    config.files.minJs,
    '!' + config.paths.assets + 'compiled/**.*.*'
  ])
    .pipe($.changed(config.paths.dist + '/' + config.paths.assets))
    .pipe(gulp.dest(config.paths.dist + '/' + config.paths.assets));
});

gulp.task('copy:init-templates', () => {
  return gulp.src(config.paths.appBase + '/templates/**/*', {
    dot: true
  })
    .pipe(gulp.dest(config.paths.base));
});
