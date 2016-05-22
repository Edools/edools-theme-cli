'use strict';

let gulp = require('gulp');

gulp.task('build', ['clean', 'scss:comb', 'scss', 'js', 'js:vendors', 'copy']);
