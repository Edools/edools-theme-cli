'use strict';

let gutil = require('gulp-util');
let request = require('request');
let fs = require('fs');
let url = require('url');
let config = require('./config');

exports.upload_single = (file, cb) => {
  let key = file.replace(config.paths.base + config.paths.dist, '');
  let fileContents = fs.readFileSync(file, {
    encoding: 'utf-8'
  });

  let reqBody = {
    key: key,
    asset: {
      body: fileContents
    }
  };

  let uri = url.resolve(config.theme.sandbox_url, '/api/themes/' + config.theme.theme_id + '/sync/single/' + key);

  request({
    uri: uri,
    method: 'PUT',
    json: reqBody
  }, function (error, response, body) {
    if (error) {
      console.log(error);
      return;
    }

    gutil.log('Upload with success!');

    if (cb && typeof cb == 'function')
      cb(file);
  });
};
