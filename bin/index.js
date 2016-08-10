#!/usr/bin/env node

'use strict';

let program = require('commander');
let gulp = require('gulp');
let gutil = require('gulp-util');
let fs = require('fs');
let inquirer = require('inquirer');
let utils = require('./utils');
let pkg = require('../package.json');
let config = require('./config');
let wrench = require('wrench');
let service = require('./service');

if (!config.isThemeConfigValid()) {
  gutil.log(gutil.colors.red('Invalid file "theme.json".'));
  return;
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

function create(name) {
  //TODO: Clone a git repo thats have a base theme
}

function serve() {
  gulp.start('serve');
}

function upload(file) {
  if (!file || !fs.statSync(file).isFile()) {
    inquirer.prompt([
      {
        type: 'confirm',
        name: 'ok',
        message: 'You did not enter the file path, if you decide to proceed, all of the server\'s files will be overriden by local files. Do you want to upload all files?',
        default: 'n'
      }
    ]).then((res) => {
      // upload all files
      if (res.ok === true) gulp.start('deploy');
    });
  } else {
    // upload single file
    service.upload_single({
      path: file
    });
  }
}

function download(file) {
  if (!file) {
    inquirer.prompt([
      {
        type: 'confirm',
        name: 'ok',
        message: 'You did not enter the file path, if you decide to proceed, all of local files will be overriden by server\'s files. Do you want to download all files?',
        default: 'n'
      }
    ]).then((res) => {
      // download all files
      if (res.ok === true) service.download_all();
    });
  } else {
    // download single file
    service.download_single(file);
  }
}

function build() {
  gulp.start('build');
}

let cli = () => {
  this.create = create;
  this.serve = serve;
  this.upload = upload;
  this.download = download;
  this.build = build;

  utils.log_events();

  program
    .version(pkg.version);

  /**
   * Create Command
   */
  program
    .command('create <name>')
    .alias('c')
    .description('Create a new Edools theme.')
    .action(this.create);


  /**
   * Serve Command
   */
  program
    .command('serve')
    .alias('s')
    .description('Create a local server which observes for changes in your local files and upload it to your sandbox url.')
    .action(this.serve);


  /**
   * Upload Command
   */
  program
    .command('upload [file]')
    .alias('u')
    .description('Upload a file or uploads all files by giving empty file arg.')
    .action(this.upload);


  /**
   * Download Command
   */
  program
    .command('download [file]')
    .alias('d')
    .description('Download a file or download all files by giving empty file arg.')
    .action(this.download);


  /**
   * Build Command
   */
  program
    .command('build')
    .alias('b')
    .description('Build theme locally.')
    .action(this.build);


  /**
   * Signin Command
   */
  program
    .command('signin')
    .alias('si')
    .description('Signin user.')
    .option('e, --email <email>', 'User\'s email.')
    .option('p, --password <password>', 'User\'s password.')
    .action(this.signin);

  program.parse(process.argv);
};

process.nextTick(cli);
