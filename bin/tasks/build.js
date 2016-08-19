'use strict';

let gulp = require('gulp');
let config = require('../config');
let runSequence = require('run-sequence');

gulp.task('build', (cb) => {
  let tasks = [
    'js',
    'copy:liquid',
    'copy:images'];

  if (config.isBowerEnabled()) {
    tasks.push('js:vendors');
  }

  if (config.isCSSCombEnabled()) {
    tasks.push('scss:comb');
  }

  if (config.isScssEnabled()) {
    tasks.push('scss');
  }

  runSequence('clean', tasks, cb);
});
