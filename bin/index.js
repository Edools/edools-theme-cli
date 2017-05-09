#!/usr/bin/env node

'use strict';

let program = require('commander');
let gulp = require('gulp');
let fs = require('fs');
let path = require('path');
let gutil = require('gulp-util');
let inquirer = require('inquirer');
let utils = require('./utils');
let pkg = require('../package.json');
let config = require('./config');
let git = require('simple-git')(config.paths.base);
let wrench = require('wrench');
let service = require('./service');

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

function init(name, author) {
  let themeJson = {
    "name": name,
    "description": "put-your-theme-description-here",
    "author": author || '',
    "folder_name": name,
    "development": {
      "url": "https://myschool.com",
      "school_id": 0,
      "theme_id": 0,
      "token": "put-your-token-here"
    }
  };

  gulp.start('copy:init-templates');

  fs.writeFileSync(config.paths.base + 'theme.json', JSON.stringify(themeJson, null, 2));
}

function serve(env) {
  env = config.handleEnv(env);
  config.env = env;
  config.isEnvValid(env);

  service.is_protected_theme(env, (isProtected) => {
    if (isProtected !== true) {
      gulp.start('serve');
    } else {
      gutil.log(gutil.colors.red('This theme is protected, you can\'t live edit protected themes!'));
    }
  });
}

function upload(file = null, env = null) {

  // Handle command without file argument. Eg: edt u development
  let envs = ['development', 'staging', 'production'];
  if (envs.indexOf(file) > -1 && env === null) {
    env = file;
    file = null;
  }

  env = config.handleEnv(env);
  config.env = env;
  config.isEnvValid(env);

  service.is_protected_theme(env, (isProtected) => {
    if (isProtected !== true) {
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
          if (res.ok === true) gulp.start('deploy:development');
        });
      } else {
        // upload single file
        service.upload_single(config.env, {
          path: file
        });
      }
    } else {
      gutil.log(gutil.colors.red('This theme is protected, you can\'t upload files to protected themes. Please use deploy command!'));
    }
  });
}

function download(file = null, env = null) {

  // Handle command without file argument. Eg: edt u development
  let envs = ['development', 'staging', 'production'];
  if (envs.indexOf(file) > -1 && env === null) {
    env = file;
    file = null;
  }

  env = config.handleEnv(env);

  config.env = env;
  config.isEnvValid(env);

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
      if (res.ok === true) service.download_all(env);
    });
  } else {
    // download single file
    service.download_single(env, file);
  }
}

function build() {
  gulp.start('build');
}

function deploy(env) {
  git.status((err, res) => {
    let branch = res.current;
    let modified = res.files.length > 0;

    config.isEnvValid(env);
    if ((env === 'staging' && branch !== 'dev') || (env === 'production' && branch !== 'master')) {
      gutil.log(gutil.colors.red('You cannot deploy from branch "' + branch + '", you can only deploy from "dev" for staging or "master" for production.'));
      return;
    }

    if (modified === true) {
      gutil.log(gutil.colors.red('You have modified files in your current branch, please commit and push before deploy.'));
      return;
    }

    gulp.start('deploy:' + env);
  });
}

let cli = () => {
  this.init = init;
  this.serve = serve;
  this.upload = upload;
  this.download = download;
  this.build = build;
  this.deploy = deploy;

  utils.log_events();

  program
    .version(pkg.version);

  /**
   * Create Command
   */
  program
    .command('init <name> [author]>')
    .alias('i')
    .description('Start a new Edools theme.')
    .action(this.init);


  /**
   * Serve Command
   */
  program
    .command('serve [env]')
    .alias('s')
    .description('Create a local server which observes for changes in your local files and upload it to your enviroment url.')
    .action(this.serve);


  /**
   * Upload Command
   */
  program
    .command('upload [file] [env]')
    .alias('u')
    .description('Upload a file or uploads all files by giving empty file arg.')
    .action(this.upload);


  /**
   * Download Command
   */
  program
    .command('download [file] [env]')
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
   * Deploy Command
   */
  program
    .command('deploy <env>')
    .description('Deploy theme to production or staging enviroments, you\'ll need the CLI App Token')
    .action(this.deploy);

  program.parse(process.argv);
};

process.nextTick(cli);
