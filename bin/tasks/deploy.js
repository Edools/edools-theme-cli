'use strict';

let gulp = require('gulp');
let glob = require('glob-all');
let config = require('../config');
let sync = require('../service');

gulp.task('deploy', ['build'], (cb) => {
  let files = glob.sync([config.paths.dist + '**/*.*']
    .concat(config.files.ignore_for_deploy));

  sync.upload_all(files, cb);
});
