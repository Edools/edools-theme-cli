'use strict';

let gulp = require('gulp');
let $ = require('gulp-load-plugins')();
let config = require('../config');
let combConfig = require(config.paths.base + '.csscomb.json');
let comb = new require('csscomb')(combConfig);

gulp.task('scss', () => {
  return gulp.src(config.files.scss)
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      outputStyle: 'compressed'
    }).on('error', $.sass.logError))
    .pipe($.concat(config.build.css))
    .pipe($.stripCssComments())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(config.paths.dist + config.paths.assets));
});

gulp.task('scss:comb', function (cb) {
  comb.processPath(config.paths.scss);
  cb();
});
