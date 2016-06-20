'use strict';

let gutil = require('gulp-util');
let request = require('request');
let fs = require('fs');
let _ = require('lodash');
let url = require('url');
let through = require('through2');
let config = require('./config');

let upload_single = (file, cb) => {
  let key = file.path.replace(config.paths.base + config.paths.dist, '');
  let isImage = file.path.match(/\.(gif|jpg|jpeg|png)$/i);

  let fileContents = fs.readFileSync(file.path, !isImage ? {
    encoding: 'utf-8'
  } : null);

  if (isImage) {
    fileContents = new Buffer(fileContents).toString('base64');
  }

  let uri = url.resolve(config.theme.sandbox_url, '/api/themes/' + config.theme.sandbox_theme_id + '/sync/single/' + key);

  request({
    uri: uri,
    method: 'PUT',
    json: {
      school_id: config.theme.sandbox_school_id,
      key: key,
      asset: {
        body: fileContents
      }
    }
  }, function (err, res) {
    if (res.statusCode === 204) {
      gutil.log(`${key} uploaded with success!`);
    }

    if (cb && typeof cb === 'function') cb(err, file);
  });
};

let upload_all = (files, cb) => {
  let assets = _.map(files, (file) => {
    let key = file.replace(config.paths.dist, '');
    let isImage = file.match(/\.(gif|jpg|jpeg|png)$/i);

    let fileContents = fs.readFileSync(file, !isImage ? {
      encoding: 'utf-8'
    } : null);

    if (isImage) {
      fileContents = new Buffer(fileContents).toString('base64');
    }

    return {
      key: key,
      body: fileContents
    }
  });

  let uri = url.resolve(config.theme.sandbox_url, '/api/themes/' + config.theme.sandbox_theme_id + '/sync/batch');

  request({
    uri: uri,
    method: 'PUT',
    json: {
      school_id: config.theme.sandbox_school_id,
      assets: assets
    }
  }, function (err, res, body) {
    if (res.statusCode === 204) {
      gutil.log('All files uploaded successfully!');
    } else {
      console.log(body);
    }

    if (cb && typeof cb === 'function') cb(err, files);
  });
};

let update_theme = (cb) => {
  let uri = url.resolve(config.theme.sandbox_url, '/api/themes/' + config.theme.sandbox_theme_id + '/sync');
  let theme = JSON.parse(fs.readFileSync(config.paths.base + 'theme.json'));

  request({
    uri: uri,
    method: 'PUT',
    json: {
      theme: {
        name: theme.name,
        description: theme.description
      }
    }
  }, function (err, res) {
    if (res.statusCode === 204) {
      gutil.log('Theme updated successfully!');
    }

    if (cb && typeof cb === 'function') cb(err);
  });
};

let upload_single_stream = through.obj((file, enc, callback) => {
  upload_single(file, (err, file) => {
    callback(err, file);
  });
});

exports.upload_single = upload_single;
exports.upload_all = upload_all;
exports.update_theme = update_theme;
exports.upload_single_stream = upload_single_stream;
