'use strict';

let gutil = require('gulp-util');
let path = require('path');
let request = require('request');
let fs = require('fs');
let _ = require('lodash');
let through = require('through2');
let config = require('./config');

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
    default: {
      gutil.log(gutil.log(gutil.colors.red('Response Status: ' + res.statusCode)));
    }
  }
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

function upload_single(file, cb, env) {
  let key = file.path.replace(config.paths.base + config.paths.dist, '');
  let isBinary = file.path.match(/\.(gif|jpg|jpeg|png|svg)$/i);

  let fileContents = fs.readFileSync(file.path, !isBinary ? {
    encoding: 'utf-8'
  } : null);

  if (isBinary) {
    fileContents = new Buffer(fileContents).toString('base64');
  }

  let uri = config.getSchoolUrl(env, '/sync/' + key);

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
    if (res.statusCode === 204) {
      gutil.log(gutil.colors.green(`${key} uploaded successfully!`));
    } else {
      handle_response_error(res);
      return;
    }

    if (cb && typeof cb === 'function') cb(err, file);
  });
}

function update_theme(cb, env) {
  let uri = config.getSchoolUrl(env, '/sync/update_theme');
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

function upload_all(files, cb, env) {
  let assets = _.map(files, (file) => {
    let key = file.replace(config.paths.dist, '');
    let isBinary = file.match(/\.(gif|jpg|jpeg|png|svg)$/i);

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

  let uri = config.getSchoolUrl(env, '/sync/batch');

  let data = {
    assets: assets
  };

  if (env == 'development') {
    data.school_id = config.getSchoolId(env);
  }

  request({
    uri: uri,
    method: 'PUT',
    headers: config.getDefaultRequestHeaders(env),
    json: data
  }, function (err, res) {
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

function download_single(key, cb, env) {
  let uri = config.getSchoolUrl(env, '/sync/' + key);

  request({
    uri: uri,
    method: 'GET',
    headers: config.getDefaultRequestHeaders(env),
    json: {
      school_id: config.getSchoolId(env),
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

function download_all(cb, env) {
  let uri = config.getSchoolUrl(env, '/sync/');

  request({
    uri: uri,
    method: 'GET',
    headers: config.getDefaultRequestHeaders(env),
    json: {
      school_id: config.getSchoolId(env)
    }
  }, function (err, res) {
    console.log(err);

    if (!err && res && res.statusCode === 200) {
      let assets = res.body;

      _.each(assets, asset => {
        save_downloaded_asset(asset);
      });

      gutil.log(gutil.colors.green('All files downloaded successfully!'));
    } else {
      handle_response_error(res);
      return;
    }

    if (cb && typeof cb === 'function') cb(err);
  });
}

const upload_single_stream = through.obj((file, enc, callback) => {
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
