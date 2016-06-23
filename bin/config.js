'use strict';

let gutil = require('gulp-util');
let _ = require('lodash');

exports.paths = {
  base: process.cwd() + '/',
  dist: 'dist/',
  assets: 'assets/',
  scss: 'assets/scss/',
  css: 'assets/css/',
  js: 'assets/js/',
  images: 'assets/images/',
  layouts: 'layouts/',
  snippets: 'snippets/',
  templates: 'templates/',
  config: 'config/',
  locales: 'locales/'
};

exports.files = {
  themeConfig: 'theme.json',
  liquid: [
    exports.paths.assets + '**/*.liquid',
    exports.paths.snippets + '**/*.liquid',
    exports.paths.templates + '**/*.liquid',
    exports.paths.layouts + '**/*.liquid'
  ],
  json: [
    exports.paths.config + '**/*.json',
    exports.paths.locales + '**/*.json'
  ],
  js: [
    exports.paths.js + 'components/**/*.js',
    exports.paths.js + 'main.js'
  ],
  js_vendors: exports.paths.js + 'vendors/**/*.js',
  scss: exports.paths.scss + 'theme.base.scss',
  images: [
    exports.paths.images + '**/*.jpg',
    exports.paths.images + '**/*.jpeg',
    exports.paths.images + '**/*.png',
    exports.paths.images + '**/*.gif'
  ],
  ignore_for_deploy: [
    '!**/*.map'
  ]
};

exports.build = {
  js: 'theme.base.min.js',
  js_vendor: 'theme.base.vendors.min.js',
  css: 'theme.base.min.css'
};

exports.theme = require(exports.paths.base + 'theme.json');

exports.wiredep = {
  exclude: [
    /\/bootstrap-sass\/.*\.js/
  ],
  directory: 'bower_components'
};

exports.browser_sync = {
  open: true,
  files: [
    exports.paths.dist + exports.paths.assets + '*.css',
    exports.paths.dist + exports.paths.assets + '*.js'
  ],
  serveStatic: [exports.paths.dist],
  proxy: exports.theme.sandbox_url,
  port: 5000,
  ghostMode: false,
  rewriteRules: [
    {
      match: /(\/\/(.*)\/e\/files\/(.*)[0-9]\/)((?!.*theme.js)(?!.*theme.scss)(?!.*.(png|jpg|jpeg|gif)))/g,
      replace: '/assets/'
    }
  ],
  snippetOptions: {
    rule: {
      match: /<\/head>/i,
      fn: function (snippet, match) {
        return snippet + match;
      }
    }
  }
};

exports.errorHandler = (title) => {
  return (err) => {
    gutil.log(gutil.colors.red('[' + title + ']'), err.toString());
    this.emit('end');
  };
};
