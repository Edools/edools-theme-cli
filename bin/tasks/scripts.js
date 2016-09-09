'use strict';

let gulp = require('gulp');
let $ = require('gulp-load-plugins')();
let es2015 = require('babel-preset-es2015');
let config = require('../config');
let wiredep = require('wiredep');

gulp.task('js:vendors', () => {
  let localVendors = [config.paths.base + config.files.js_vendors];
  let bowerJs = wiredep(config, wiredep).js;
  let vendors = bowerJs.concat(localVendors);

  return gulp.src(vendors)
    .pipe($.sourcemaps.init())
    .pipe($.uglify({
      mangle: false
    }))
    .pipe($.concat(config.build.js_vendor))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(config.paths.dist + config.paths.assets))
    .pipe(gulp.dest(config.paths.compiled));
});

gulp.task('js', () => {
  return gulp.src(config.files.js)
    .pipe($.sourcemaps.init())
    .pipe($.concat(config.build.js))
    .pipe($.babel({
      presets: [es2015]
    }))
    .pipe($.uglify().on('error', config.errorHandler('uglify')))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(config.paths.dist + config.paths.assets))
    .pipe(gulp.dest(config.paths.compiled));
});
