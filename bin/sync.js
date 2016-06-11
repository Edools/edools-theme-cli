'use strict';

let gutil = require('gulp-util');
let request = require('request');
let fs = require('fs');
let url = require('url');
let config = require('./config');

exports.upload_single = (file, cb) => {
  let key = file.replace(config.paths.base + config.paths.dist, '');
  let isImage = file.match(/\.(gif|jpg|jpeg|png)$/i);

  let fileContents = fs.readFileSync(file, !isImage ? {
    encoding: 'utf-8'
  } : null);

  if (isImage) {
    fileContents = new Buffer(fileContents).toString('base64');
  }

  let reqBody = {
    school_id: config.theme.sandbox_school_id,
    key: key,
    asset: {
      body: fileContents
    }
  };

  let uri = url.resolve(config.theme.sandbox_url, '/api/themes/' + config.theme.sandbox_theme_id + '/sync/single/' + key);

  request({
    uri: uri,
    method: 'PUT',
    json: reqBody
  }, function (err, res) {
    if (res.statusCode == 204) {
      gutil.log(`${key} uploaded with success!`);
    }

    if (cb && typeof cb === 'function') cb(err, file);
  });
};
