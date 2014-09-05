'use strict';

var env = process.env;
var utils = require(env.APP_LIB_DIR + '/utils');

function onCreate(req, res, next) {
  res.send(200, 'STATUS - OK');
}

module.exports = function(app) {
  app.get('/.status', onStatus);
};