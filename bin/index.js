#!/usr/bin/env node

'use strict';

let program = require('commander');
let gulp = require('gulp');
let gulpLoadPlugins = require('gulp-load-plugins');
let gutil = require('gulp-util');
let prettyTime = require('pretty-hrtime');
let chalk = require('chalk');
let pkg = require('../package.json');
let path = require('path');
let through = require('through2');
let wiredep = require('wiredep');
let exec = require('child_process').exec;
let del = require('del');
let $ = gulpLoadPlugins();
let config = require('./config');
var wrench = require('wrench');

/**
 *  This will load all js or coffee files in the tasks directory
 *  in order to load all gulp tasks
 */
wrench.readdirSyncRecursive(__dirname + '/tasks')
  .filter((file) => {
    return (/\.(js|coffee)$/i).test(file);
  }).map((file) => {
  require('./tasks/' + file);
});

let cli = () => {
  this.log_events = log_events;
  this.create = create;
  this.serve = serve;
  this.up = up;
  this.build = build;
  this.log_events();

  program
    .version(pkg.version)
    .option('c, --create <name>', 'Create a new Edools theme', this.create, null)
    .option('s, --serve', 'Create a local server', this.serve, null)
    .option('u, --up', 'Upload theme', this.up, null)
    .option('b, --build', 'Build theme', this.build, null)
    .parse(process.argv);
};

process.nextTick(cli);

function formatError(e) {
  if (!e.err) {
    return e.message;
  }

  // PluginError
  if (typeof e.err.showStack === 'boolean') {
    return e.err.toString();
  }

  // Normal error
  if (e.err.stack) {
    return e.err.stack;
  }

  // Unknown (string, number, etc.)
  return new Error(String(e.err)).stack;
}

function log_events() {
  let failed = false;

  gulp.on('err', () => {
    failed = true;
  });

  gulp.on('task_start', function (e) {
    // TODO: batch these
    // so when 5 tasks start at once it only logs one time with all 5
    gutil.log('Starting', '\'' + chalk.cyan(e.task) + '\'...');
  });

  gulp.on('task_stop', function (e) {
    let time = prettyTime(e.hrDuration);
    gutil.log(
      'Finished', '\'' + chalk.cyan(e.task) + '\'',
      'after', chalk.magenta(time)
    );
  });

  gulp.on('task_err', function (e) {
    let msg = formatError(e);
    let time = prettyTime(e.hrDuration);
    gutil.log(
      '\'' + chalk.cyan(e.task) + '\'',
      chalk.red('errored after'),
      chalk.magenta(time)
    );
    gutil.log(msg);
  });

  gulp.on('task_not_found', function (err) {
    gutil.log(
      chalk.red('Task \'' + err.task + '\' is not in your gulpfile')
    );
    gutil.log('Please check the documentation for proper gulpfile formatting');
    process.exit(1);
  });
};

function create(name) {

}

function serve() {
  gulp.start('serve');
}

function up() {
}

function build() {
  gulp.start('build');
}


/**
 * Upload theme's files to "core" database
 */
function upload(file, cb) {
  let filePath = file.path.replace(paths.base, '');

  console.log('Uploading ' + filePath + ' ...');

  exec('cd ../../../ && spring rake liquid:upload_files[' + filePath + ']',
    function (err, stdout, stderr) {
      console.log(stdout);

      if (err)
        console.log(stderr);

      else if (cb) cb(file);
    });
}

/**
 * Stream to use upload function in gulp pipe
 */
function uploadStream() {
  return through.obj(function (file, enc, callback) {
    upload(file, () => {
      callback(null, file);
    });
  });
}

gulp.task('deploy', ['build'], () => {
  return gulp.src(deployPaths)
    .pipe(uploadStream())
});
