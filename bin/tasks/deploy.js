'use strict';

let gulp = require('gulp');
let glob = require('glob-all');
let config = require('../config');
let sync = require('../service');

gulp.task('deploy:development', ['build'], (cb) => {
  let files = glob.sync([config.paths.dist + '**/*.*']
    .concat(config.files.ignore_for_deploy));

  sync.upload_all(files, cb, 'development');
});

gulp.task('deploy:staging', ['build'], (cb) => {
  let files = glob.sync([config.paths.dist + '**/*.*']
    .concat(config.files.ignore_for_deploy));

  sync.upload_all(files, cb, 'staging');
});

gulp.task('deploy:production', ['build'], (cb) => {
  let files = glob.sync([config.paths.dist + '**/*.*']
    .concat(config.files.ignore_for_deploy));

  sync.upload_all(files, cb, 'production');
});
