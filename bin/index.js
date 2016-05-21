#!/usr/bin/env node

'use strict';

let program = require('commander');
let gulp = require('gulp');
let gutil = require('gulp-util');
let prettyTime = require('pretty-hrtime');
let chalk = require('chalk');
let pkg = require('../package.json');
let config = require('./config');
let wrench = require('wrench');
let auth = require('./auth');

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
}

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
 *  This will load all js files in the tasks directory
 *  in order to load all gulp tasks
 */
wrench.readdirSyncRecursive(__dirname + '/tasks')
  .filter((file) => {
    return (/\.js$/i).test(file);
  }).map((file) => {
  require('./tasks/' + file);
});

let cli = () => {
  this.log_events = log_events;
  this.signin = auth.signin;
  this.create = create;
  this.serve = serve;
  this.up = up;
  this.build = build;
  this.log_events();

  program
    .version(pkg.version)
    .option('c, --create <name>', 'creates a new Edools theme', this.create, null)
    .option('s, --serve', 'creates a local server which observes for changes in your local files and upload the files to your sandbox url.', this.serve, null)
    .option('u, --up', 'uploads theme', this.up, null)
    .option('b, --build', 'builds theme locally', this.build, null)
    .option('si, --sign-in', 'signin user', this.signin, null)
    .parse(process.argv);
};

process.nextTick(cli);
