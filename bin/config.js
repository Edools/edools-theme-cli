'use strict';

let gutil = require('gulp-util');
let path = require('path');
let fs = require('fs');
let url = require('url');
let _ = require('lodash');

exports.fileExists = (filePath) => {
  try {
    return fs.statSync(filePath).isFile();
  }
  catch (err) {
    return false;
  }
};

exports.paths = {
  base: process.cwd() + '/',
  appBase: __dirname,
  dist: 'dist/',
  compiled: 'assets/compiled/',
  assets: 'assets/',
  scss: 'assets/scss/',
  css: 'assets/css/',
  js: 'assets/js/',
  fonts: 'assets/fonts/',
  images: 'assets/images/',
  layouts: 'layouts/',
  snippets: 'snippets/',
  templates: 'templates/',
  mailers: 'mailers/',
  config: 'config/',
  locales: 'locales/'
};

exports.files = {
  themeConfig: 'theme.json',
  liquid: [
    exports.paths.assets + '**/*.liquid',
    exports.paths.snippets + '**/*.liquid',
    exports.paths.templates + '**/*.liquid',
    exports.paths.layouts + '**/*.liquid',
    exports.paths.mailers + '**/*.liquid'
  ],
  json: [
    exports.paths.config + '**/*.json',
    exports.paths.locales + '**/*.json'
  ],
  js: [
    exports.paths.js + 'components/**/*.js',
    exports.paths.js + 'main.js'
  ],
  fonts: [
    exports.paths.fonts + '**/*.ttf',
    exports.paths.fonts + '**/*.eot',
    exports.paths.fonts + '**/*.otf',
    exports.paths.fonts + '**/*.woff',
    exports.paths.fonts + '**/*.svg'
  ],
  js_vendors: exports.paths.js + 'vendors/**/*.js',
  scss: exports.paths.scss + 'theme.base.scss',
  css: exports.paths.assets + '**/*.css',
  minJs: exports.paths.assets + '**/*.min.js',
  images: [
    exports.paths.images + '**/*.jpg',
    exports.paths.images + '**/*.jpeg',
    exports.paths.images + '**/*.png',
    exports.paths.images + '**/*.gif',
    exports.paths.images + '**/*.svg'
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

const themePath = exports.paths.base + 'theme.json';
const cssCombPath = exports.paths.base + '.csscomb.json';
const bowerJsonPath = exports.paths.base + 'bower.json';
const scssMainPath = exports.paths.scss + 'theme.base.scss';

exports.theme = exports.fileExists(themePath) ? require(themePath) : {};
exports.cssCombConfig = exports.fileExists(cssCombPath) ? require(cssCombPath) : {};

exports.isThemeConfigValid = () => {
  return (exports.theme &&
  (exports.theme.sandbox_url &&
  exports.theme.sandbox_theme_id &&
  exports.theme.sandbox_school_id &&
  exports.theme.token) ||
  (exports.theme.development &&
  exports.theme.development.theme_id &&
  exports.theme.development.school_id &&
  exports.theme.development.token) ||
  (exports.theme.staging &&
  exports.theme.staging.theme_id &&
  exports.theme.staging.school_id &&
  exports.theme.staging.token) ||
  (exports.theme.production &&
  exports.theme.production.theme_id &&
  exports.theme.production.school_id &&
  exports.theme.production.token));
};

exports.isBowerEnabled = () => {
  return exports.fileExists(bowerJsonPath);
};

exports.isScssEnabled = () => {
  return exports.fileExists(scssMainPath);
};

exports.isCSSCombEnabled = () => {
  return exports.fileExists(cssCombPath);
};

exports.getSchoolUrl = (env, path) => {
  env = env || 'development';

  let themeId = exports.theme.sandbox_theme_id || exports.theme[env].theme_id;
  let apiUrl = exports.theme.sandbox_url || exports.theme[env].url;

  return url.resolve(apiUrl, '/api/themes/' + themeId + path);
};

exports.getDefaultRequestHeaders = (env) => {
  env = env || 'development';

  return {
    'Authorization': 'Token token=' + (exports.theme.token || exports.theme[env].token)
  };
};

exports.getSchoolId = (env) => {
  env = env || 'development';

  return exports.theme.sandbox_school_id || exports.theme[env].school_id;
};

exports.wiredep = {
  exclude: [
    /\/bootstrap-sass\/.*\.js/
  ],
  directory: 'bower_components'
};

let assetRegex = "" +
  "(" +
  "(\/\/(.*)\/e\/files\/(.*)[0-9]\/)" + // Dev
  "|" +
  "(https\:\/\/s3\.amazonaws\.\com\/core_development\/(.*)\/assets\/)" + // Dev
  "|" +
  "(https\:\/\/edools\-3\-staging\.s3\.amazonaws\.com\/(.*)\/assets\/)" + // Staging
  "|" +
  "(https\:\/\/static\-cdn\.myedools\.com\/(.*)\/assets\/)" + // Production
  ")" +
  "(\.(.*)\.(css|js))" +
  "(?!.*theme.js)" +
  "(?!.*theme.scss.css)" +
  "(?!.*.(png|jpg|jpeg|gif))";

if (!exports.isScssEnabled() || !exports.isBowerEnabled()) {
  assetRegex = assetRegex.replace(')))', '))(?!.*.min.*))');
}

exports.browser_sync = {
  open: true,
  files: [
    exports.paths.dist + exports.paths.assets + '*.css',
    exports.paths.dist + exports.paths.assets + '*.js'
  ],
  serveStatic: [exports.paths.dist],
  proxy: exports.theme.sandbox_url || exports.theme.development.url,
  port: 5000,
  ghostMode: false,
  rewriteRules: [
    {
      match: new RegExp(assetRegex, 'g'),
      fn: (req, res, match) => {
        if (match.indexOf('/assets/assets/') <= -1) return match;

        match = match.split('/assets/assets/')[1];

        let splited = match.split('.');
        return '/assets/' + splited
            .filter((x) => {
              return isNaN(x);
            }).join('.');
      }
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
