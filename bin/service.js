'use strict';

let gutil = require('gulp-util');
let path = require('path');
let request = require('request');
let fs = require('fs');
let _ = require('lodash');
let url = require('url');
let through = require('through2');
let config = require('./config');

let headers = {
  'Authorization': 'Token token=' + config.theme.token
};

function ensureDirectoryExistence(filePath) {
  var dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

function handle_response_error(res) {
  switch (res.statusCode) {
    case 404: {
      gutil.log(gutil.log(gutil.colors.red('404 - Resource not found')));
      break;
    }
    case 401: {
      gutil.log(gutil.log(gutil.colors.red('401 - Resource Not Authorized')));
      break;
    }
    case 500: {
      gutil.log(gutil.log(gutil.colors.red('500 - Internal Server Error')));
      break;
    }
  }
}

function upload_single(file, cb) {
  let key = file.path.replace(config.paths.base + config.paths.dist, '');
  let isBinary = file.path.match(/\.(gif|jpg|jpeg|png|svg)$/i);

  let fileContents = fs.readFileSync(file.path, !isBinary ? {
    encoding: 'utf-8'
  } : null);

  if (isBinary) {
    fileContents = new Buffer(fileContents).toString('base64');
  }

  let uri = url.resolve(config.theme.sandbox_url, '/api/themes/' + config.theme.sandbox_theme_id + '/sync/' + key);

  request({
    uri: uri,
    method: 'PUT',
    headers: headers,
    json: {
      school_id: config.theme.sandbox_school_id,
      key: key,
      asset: {
        body: fileContents
      }
    }
  }, function (err, res) {
    if (res.statusCode === 204) {
      gutil.log(gutil.colors.green(`${key} uploaded successfully!`));
    } else {
      handle_response_error(res);
      return;
    }

    if (cb && typeof cb === 'function') cb(err, file);
  });
}

function update_theme(cb) {
  let uri = url.resolve(config.theme.sandbox_url, '/api/themes/' + config.theme.sandbox_theme_id + '/sync/update_theme');
  let theme = JSON.parse(fs.readFileSync(config.paths.base + 'theme.json'));

  request({
    uri: uri,
    method: 'PUT',
    headers: headers,
    json: {
      theme: {
        name: theme.name,
        description: theme.description
      }
    }
  }, function (err, res) {
    if (res.statusCode === 204) {
      gutil.log(gutil.colors.green('Theme updated successfully!'));
      config.theme = theme;
    } else {
      handle_response_error(res);
      return;
    }

    if (cb && typeof cb === 'function') cb(err);
  });
}

function upload_all(files, cb) {
  let assets = _.map(files, (file) => {
    let key = file.replace(config.paths.dist, '');
    let isBinary = file.match(/\.(gif|jpg|jpeg|png)$/i);

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

  let uri = url.resolve(config.theme.sandbox_url, '/api/themes/' + config.theme.sandbox_theme_id + '/sync/batch');

  request({
    uri: uri,
    method: 'PUT',
    headers: headers,
    json: {
      school_id: config.theme.sandbox_school_id,
      assets: assets
    }
  }, function (err, res, body) {
    if (res.statusCode === 204) {
      gutil.log(gutil.colors.green('All files uploaded successfully!'));
    } else {
      handle_response_error(res);
      return;
    }

    update_theme(() => {
      if (cb && typeof cb === 'function') cb(err, files);
    });
  });
}

function save_downloaded_asset(asset) {
  if (!asset.key) return;

  let key = asset.key;
  let isImage = key.match(/\.(gif|jpg|jpeg|png)$/i);
  let isBinary = asset.src !== null;
  let targetPath = isImage ? 'assets/images/' + key.replace('assets/', '') : key;

  let tardetFilePath = path.join(config.paths.base, targetPath);

  ensureDirectoryExistence(tardetFilePath);

  fs.writeFileSync(tardetFilePath, asset.body, isBinary ? 'base64' : 'utf-8');
}

function download_single(key, cb) {
  let uri = url.resolve(config.theme.sandbox_url, '/api/themes/' + config.theme.sandbox_theme_id + '/sync/' + key);

  request({
    uri: uri,
    method: 'GET',
    headers: headers,
    json: {
      school_id: config.theme.sandbox_school_id,
      key: key
    }
  }, function (err, res) {

    save_downloaded_asset(res.body);

    if (res.statusCode === 200) {
      gutil.log(gutil.colors.green(`${key} downloaded successfully!`));
    } else {
      handle_response_error(res);
      return;
    }

    if (cb && typeof cb === 'function') cb(err);
  });
}

function download_all(cb) {
  let uri = url.resolve(config.theme.sandbox_url, '/api/themes/' + config.theme.sandbox_theme_id + '/sync/');

  request({
    uri: uri,
    method: 'GET',
    headers: headers,
    json: {
      school_id: config.theme.sandbox_school_id
    }
  }, function (err, res) {
    let assets = res.body;

    _.each(assets, asset => {
      save_downloaded_asset(asset);
    });

    if (res.statusCode === 200) {
      gutil.log(gutil.colors.green('All files downloaded successfully!'));
    } else {
      handle_response_error(res);
      return;
    }

    if (cb && typeof cb === 'function') cb(err);
  });
}

let upload_single_stream = through.obj((file, enc, callback) => {
  upload_single(file, (err, file) => {
    callback(err, file);
  });
});

exports.upload_single = upload_single;
exports.upload_all = upload_all;
exports.update_theme = update_theme;
exports.download_single = download_single;
exports.download_all = download_all;
exports.upload_single_stream = upload_single_stream;
