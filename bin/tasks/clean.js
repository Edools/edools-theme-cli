'use strict';

let gulp = require('gulp');
let del = require('del');
let config = require('../config');

gulp.task('clean', (cb) => {
  del(config.paths.dist).then(() => cb());
});
