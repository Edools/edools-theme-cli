'use strict';

let gulp = require('gulp');
let config = require('../config');
let combConfig = require(config.paths.base + '.csscomb.json');
let comb = new require('csscomb')(combConfig);
let browserSync = require('browser-sync').create();
let sync = require('../sync');

gulp.task('serve', ['build'], () => {

  browserSync.init(config.browser_sync);

  gulp.watch(config.paths.scss + '**/*.scss', ['scss']);
  gulp.watch(config.paths.scss + '**/*.scss').on('change', function (file) {
    comb.processFile(file.path);
  });

  gulp.watch(config.files.liquid
    .concat(config.files.json), ['copy']);

  gulp.watch(config.files.js, ['js']);

  gulp.watch('bower.json', ['js:vendors']);

  gulp.watch([
      config.paths.dist + '**/*.*',
      '!**/*.map'
    ])
    .on('change', function (file) {
      sync.upload_single(file.path, (err, f) => {
        if (f.indexOf('.liquid') > -1 ||
          f.indexOf('.json') > -1 ||
          f.indexOf('.js') > -1) {
          browserSync.reload();
        }
      });
    });
});
