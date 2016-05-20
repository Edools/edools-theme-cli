'use strict';

let gulp = require('gulp');
let config = require('../config');
let combConfig = require(config.paths.base + '.csscomb.json');
let comb = new require('csscomb')(combConfig);
let browserSync = require('browser-sync').create();

gulp.task('serve', ['build'], () => {

  browserSync.init(config.browser_sync);

  gulp.watch(config.paths.scss + '**/*.scss', ['scss']);
  gulp.watch(config.paths.scss + '**/*.scss').on('change', function (file) {
    comb.processFile(file.path);
  });

  gulp.watch(config.files.js, ['js']);
  gulp.watch(config.paths.base + 'bower.json', ['js:vendors']);

  // upload assets
  // gulp.watch(deployPaths)
  //   .on('change', function (file) {
  //     upload(file, function (f) {
  //       if (f.path.indexOf('.liquid') > -1 ||
  //         f.path.indexOf('.json') > -1 ||
  //         f.path.indexOf('.js') > -1) {
  //         browserSync.reload();
  //       }
  //     });
  //   });
});
