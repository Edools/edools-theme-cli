'use strict';

let gulp = require('gulp');
let gutil = require('gulp-util');
let fs = require('fs');
let config = require('../config');
let combConfig = config.cssCombConfig;
let comb = new require('csscomb')(combConfig);
let browserSync = require('browser-sync').create();
let sync = require('../service');

gulp.task('serve', ['build'], () => {
  let bsConfig = config.browser_sync;
  bsConfig.proxy = `${config.theme[config.env].url}?design_theme_id=${config.getThemeId(config.env)}`;
  browserSync.init(bsConfig);

  gulp.watch(config.paths.scss + '**/*.scss', {cwd: './'}, ['scss'])
    .on('change', function (file) {
      if (config.isCSSCombEnabled()) {
        comb.processFile(file.path);
      }
    });

  gulp.watch(config.files.liquid.concat(config.files.json).concat(config.files.fonts), {cwd: './'}, ['copy:liquid']);
  gulp.watch(config.files.images, {cwd: './'}, ['copy:images']);
  gulp.watch(config.files.js, {cwd: './'}, ['js']);
  gulp.watch('bower.json', {cwd: './'}, ['js:vendors']);

  gulp.watch([config.paths.dist + '**/*.*']
    .concat(config.files.ignore_for_deploy), {cwd: './'})
    .on('change', function (file) {
      if (fs.lstatSync(file.path).isDirectory()) return;
      sync.upload_single(config.env, file, (err, f) => {
        if (f.path.indexOf('.liquid') > -1 ||
          f.path.indexOf('.json') > -1 ||
          f.path.indexOf('.js') > -1) {
          browserSync.reload();
        }
      });
    });

  gulp.watch(config.files.themeConfig, {cwd: './'})
    .on('change', () => {
      sync.update_theme(config.env);
    });
});
