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

  browserSync.init(config.browser_sync);

  gulp.watch(config.paths.scss + '**/*.scss', ['scss']);

  if (config.isCSSCombEnabled()) {
    gulp.watch(config.paths.scss + '**/*.scss').on('change', function (file) {
      comb.processFile(file.path);
    });
  }

  gulp.watch(config.files.liquid.concat(config.files.json).concat(config.files.fonts), ['copy:liquid']);
  gulp.watch(config.files.images, ['copy:images']);
  gulp.watch(config.files.js, ['js']);
  gulp.watch('bower.json', ['js:vendors']);

  gulp.watch([config.paths.dist + '**/*.*']
    .concat(config.files.ignore_for_deploy))
    .on('change', function (file) {
      if (fs.lstatSync(file.path).isDirectory()) return;
      sync.upload_single(file, (err, f) => {
        if (f.path.indexOf('.liquid') > -1 ||
          f.path.indexOf('.json') > -1 ||
          f.path.indexOf('.js') > -1) {
          browserSync.reload();
        }
      });
    });

  gulp.watch(config.files.themeConfig)
    .on('change', function (file) {
      let theme = JSON.parse(fs.readFileSync(file.path));
      sync.update_theme(theme, () => {
      });
    });
});
