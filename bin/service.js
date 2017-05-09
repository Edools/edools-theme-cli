'use strict';

let gutil = require('gulp-util');
let path = require('path');
let request = require('request');
let fs = require('fs');
let _ = require('lodash');
let through = require('through2');
let config = require('./config');
let url = require('url');

require('events').EventEmitter.defaultMaxListeners = Infinity;

function ensureDirectoryExistence(filePath) {
  let dirName = path.dirname(filePath);

  if (fs.existsSync(dirName)) {
    return true;
  }

  ensureDirectoryExistence(dirName);
  fs.mkdirSync(dirName);
}

function save_downloaded_asset(asset) {
  if (!asset.key || (config.isBowerEnabled() && asset.key.indexOf('theme.base.') !== -1)) {
    return;
  }

  let key = asset.key;
  let isImage = key.match(/\.(gif|jpg|jpeg|png|svg)$/i);
  let isBinary = asset.src !== null;
  let targetPath = isImage ? 'assets/images/' + key.replace('assets/', '') : key;

  let tardetFilePath = path.join(config.paths.base, targetPath);

  ensureDirectoryExistence(tardetFilePath);

  fs.writeFileSync(tardetFilePath, asset.body, isBinary ? 'base64' : 'utf-8');
}

function handle_response_error(err, res) {
  if (err) {
    let msg = err;
    if (typeof msg !== 'string') {
      msg = JSON.stringify(msg, null, 2);
    }

    gutil.log(gutil.colors.red(msg));
  }
  if (res) {
    switch (res.statusCode) {
      case 404: {
        gutil.log(gutil.colors.red('404 - Resource not found'));
        break;
      }
      case 401: {
        gutil.log(gutil.colors.red('401 - Resource Not Authorized'));
        break;
      }
      case 500: {
        gutil.log(gutil.colors.red('500 - Internal Server Error'));
        break;
      }
      default: {
        gutil.log(gutil.colors.red('Response Status: ' + res.statusCode));
      }
    }
  }
}

function is_protected_theme(env, cb) {
  let uri = config.getApiUrl(env);

  config.isDefaultTheme((isDefault) => {
    if (isDefault && env === 'development') {
      cb(false);
      return;
    } else if (isDefault && env !== 'development') {
      cb(true);
      return;
    }

    request({
      uri: uri,
      method: 'GET',
      headers: config.getDefaultRequestHeaders(env)
    }, function (err, res) {
      if (err) {
        handle_response_error(err, res);
        return;
      }

      let json = JSON.parse(res.body);
      if (cb && typeof cb === 'function') cb(json.protected);
    });
  });
}

function upload_single(env, file, cb) {
  let key = file.path.replace(config.paths.base + config.paths.dist, '');
  let isBinary = file.path.match(/\.(gif|jpg|jpeg|png|svg)$/i);

  let fileContents = fs.readFileSync(file.path, !isBinary ? {
    encoding: 'utf-8'
  } : null);

  if (isBinary) {
    fileContents = new Buffer(fileContents).toString('base64');
  }

  let uri = config.getApiUrl(env, '/sync/' + key);

  request({
    uri: uri,
    method: 'PUT',
    headers: config.getDefaultRequestHeaders(env),
    json: {
      school_id: config.getSchoolId(env),
      key: key,
      asset: {
        body: fileContents
      }
    }
  }, function (err, res) {
    if (!err && res && res.statusCode === 204) {
      gutil.log(gutil.colors.green(`${key} uploaded successfully!`));
    } else {
      handle_response_error(err, res);
      return;
    }

    if (cb && typeof cb === 'function') cb(err, file);
  });
}

function update_theme(env, cb) {
  let uri = config.getApiUrl(env, '/sync/update_theme');
  let theme = JSON.parse(fs.readFileSync(config.paths.base + 'theme.json'));

  request({
    uri: uri,
    method: 'PUT',
    headers: config.getDefaultRequestHeaders(env),
    json: {
      theme: {
        name: theme.name,
        author: theme.author,
        description: theme.description
      }
    }
  }, function (err, res) {
    if (!err && res && res.statusCode === 204) {
      gutil.log(gutil.colors.green('Theme updated successfully!'));
      config.theme = theme;
    } else {
      handle_response_error(err, res);
      return;
    }

    if (cb && typeof cb === 'function') cb(err);
  });
}

function upload_all(env, files, cb) {
  let assets = _.map(files, (file) => {
    let key = file.replace(config.paths.dist, '');

    let binaryFiles = config.binaryFileTypes.join('|');
    let isBinary = file.match(new RegExp(`\.(${binaryFiles})$`, 'i'));
    let fileContents = fs.readFileSync(file, !isBinary ? {
      encoding: 'utf-8'
    } : null);

    if (isBinary) {
      fileContents = new Buffer(fileContents).toString('base64');
    }

    return {
      key: key,
      body: fileContents
    };
  });

  let uri = config.getApiUrl(env, '/sync/batch');
  let schoolUrl = config.theme[env].url;

  let data = {
    assets: assets
  };

  if (schoolUrl.indexOf('core.myedools') < 0) {
    data.school_id = config.getSchoolId(env);
  }

  request({
    uri: uri,
    method: 'PUT',
    headers: config.getDefaultRequestHeaders(env),
    json: data
  }, function (err, res) {
    if (!err && res && res.statusCode === 204) {
      gutil.log(gutil.colors.green('All files uploaded successfully!'));
    } else {
      handle_response_error(err, res);
      return;
    }

    update_theme(env, () => {
      if (cb && typeof cb === 'function') cb(err, files);
    });
  });
}

function download_single(env, file, cb) {
  let uri = config.getApiUrl(env, '/sync/' + file);

  request({
    uri: uri,
    method: 'GET',
    headers: config.getDefaultRequestHeaders(env),
    json: {
      school_id: config.getSchoolId(env),
      key: file
    }
  }, function (err, res) {
    if (!err && res && res.statusCode === 200) {
      save_downloaded_asset(res.body);
      gutil.log(gutil.colors.green(`${file} downloaded successfully!`));
    } else {
      handle_response_error(err, res);
      return;
    }

    if (cb && typeof cb === 'function') cb(err);
  });
}

function download_all(env, cb) {
  let uri = config.getApiUrl(env, '/sync/');

  request({
    uri: uri,
    method: 'GET',
    headers: config.getDefaultRequestHeaders(env),
    json: {
      school_id: config.getSchoolId(env)
    }
  }, function (err, res) {
    if (!err && res && res.statusCode === 200) {
      let assets = res.body;

      _.each(assets, asset => {
        save_downloaded_asset(asset);
      });

      gutil.log(gutil.colors.green('All files downloaded successfully!'));
    } else {
      handle_response_error(err, res);
      return;
    }

    if (cb && typeof cb === 'function') cb(err);
  });
}

const upload_single_stream = through.obj((file, enc, callback) => {
  upload_single(config.env, file, (err, file) => {
    callback(err, file);
  });
});

exports.upload_single = upload_single;
exports.upload_all = upload_all;
exports.update_theme = update_theme;
exports.download_single = download_single;
exports.download_all = download_all;
exports.is_protected_theme = is_protected_theme;
exports.upload_single_stream = upload_single_stream;
