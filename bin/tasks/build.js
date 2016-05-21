'use strict';

let gulp = require('gulp');

gulp.task('build', ['scss:comb', 'scss', 'js', 'js:vendors', 'copy']);
