'use strict';

let inquirer = require('inquirer');
let config = require('./config');
let request = require('request');
let gutil = require('gulp-util');
let url = require('url');

exports.get_school_params = (cb) => {
  let endpoint = url.resolve(config.theme.sandbox_url, '/themes/params');
  return request.get({
    uri: endpoint,
    method: 'GET',
    json: true
  }, cb);
};

exports.signin = (cmd, options) => {
  console.log(options);
  exports.get_school_params((err, res, params) => {
    inquirer.prompt([
      {
        type: 'input',
        name: 'email',
        message: 'Email:'
      },
      {
        type: 'password',
        name: 'password',
        message: 'Password:'
      }
    ]).then((user) => {

      let reqBody = {
        realm: params.school,
        user: user
      };

      let endpoint = url.resolve(config.theme.sandbox_url, '/users/sign_in');

      request({
        uri: endpoint,
        method: 'POST',
        json: reqBody
      }, (err, res, data) => {
        if (err) {
          gutil.log(err);
          return;
        }

        gutil.log(data);
      });
    });
  });
};
