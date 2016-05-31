'use strict';

let gulp = require('gulp');
let runSequence = require('run-sequence');

gulp.task('build', (cb) => {
  runSequence('clean', ['scss:comb', 'scss', 'js', 'js:vendors', 'copy'], cb)
});
