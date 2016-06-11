'use strict';

let gulp = require('gulp');
let config = require('../config');
let sync = require('../sync');
var through = require('through2');

gulp.task('deploy', ['build'], () => {
  return gulp.src([
      config.paths.dist + '/**/*.*',
      '!**/*.map'
    ])
    .pipe(through.obj(function (file, enc, callback) {
      sync.upload_single(file.path, function (err, f) {
        callback(err, file);
      });
    }));
});
