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

exports.folderExists = (folderPath) => {
  try {
    return fs.statSync(folderPath).isDirectory();
  }
  catch (err) {
    return false;
  }
};

exports.binaryFileTypes = ['gif', 'jpg', 'jpeg', 'png', 'svg'];

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
  locales: 'locales/',
  hashes: 'hashes/',
  sms: 'sms/'
};

exports.files = {
  themeConfig: 'theme.json',
  liquid: [
    exports.paths.assets + '**/*.liquid',
    exports.paths.snippets + '**/*.liquid',
    exports.paths.templates + '**/*.liquid',
    exports.paths.layouts + '**/*.liquid',
    exports.paths.mailers + '**/*.liquid',
    exports.paths.hashes + '**/*.liquid',
    exports.paths.sms + '**/*.liquid'
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
  minJs: exports.paths.assets + '*.min.js',
  ignore_for_deploy: [
    '!**/*.map'
  ]
};

exports.files.images = exports.binaryFileTypes.map((t) => {
  return `${exports.paths.images}**/*.${t}`;
});

exports.build = {
  js: 'theme.base.min.js',
  js_vendor: 'theme.base.vendors.min.js',
  css: 'theme.base.min.css'
};

const themePath = exports.paths.base + 'theme.json';
const cssCombPath = exports.paths.base + '.csscomb.json';
const bowerJsonPath = exports.paths.base + 'bower.json';
const scssMainPath = exports.paths.scss + 'theme.base.scss';
const apiUrls = {
  development: 'http://core.edools-dev.com:3000',
  staging: 'https://core.myedools.info',
  production: 'https://core.myedools.com'
};

exports.theme = exports.fileExists(themePath) ? require(themePath) : {};
exports.cssCombConfig = exports.fileExists(cssCombPath) ? require(cssCombPath) : {};

exports.isGit = (cb) => {
  cb(exports.folderExists(exports.paths.base + '.git'));
};

exports.isDefaultTheme = (cb) => {
  if (exports.isGit()) {
    let git = require('simple-git')(exports.paths.base);
    git.getRemotes(true, (err, remotes) => {
      let origin = _.find(remotes, {name: 'origin'});

      if (!origin) {
        cb(false);
      }

      cb(origin.refs.fetch.indexOf('/elegance') > -1);
    });
  } else {
    cb(false);
  }
};

exports.isThemeConfigValid = () => {
  return (Boolean)(exports.theme &&
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

exports.isEnvValid = (env) => {
  if (!exports.theme[env]) {
    gutil.log(gutil.colors.red('[Invalid Enviroment]'), `Missing '${env}' in your theme.json`);
    process.exit();
  }

  return true;
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

exports.handleEnv = (env) => {
  if (!env && exports.theme.development &&
    exports.theme.development.school_id === 1) {
    env = 'development';
  } else if (!env) {
    env = 'production';
  }

  return env;
};

exports.getApiUrl = (env, path = null) => {
  env = env || 'development';

  if (!exports.isThemeConfigValid() && !exports.theme[env]) {
    gutil.log(gutil.colors.red('Your theme.json file is invalid, please check if you have all needed information in theme.json file.'));
    throw '';
  }

  let themeId = exports.theme[env].theme_id;
  let apiUrl = apiUrls[env];

  return url.resolve(apiUrl, `/themes/${themeId}${path ? path : ''}`);
};

exports.getDefaultRequestHeaders = (env) => {
  env = env || 'development';

  return {
    'Authorization': 'Token token=' + exports.theme[env].token
  };
};

exports.getSchoolId = (env) => {
  env = env || 'production';

  return exports.theme[env].school_id;
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
