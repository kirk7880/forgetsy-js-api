'use strict';

var env = process.env;
var utils = require(env.APP_LIB_DIR + '/utils');

function onFetch(req, res, next) {
  var qs = req.query;
  if (!qs.category) return res.send(400, 'Missing one or more categories!');
  if (!qs.type) return res.send(400, 'Missing the category type!');

  var category = qs.category;
  var type = qs.type;
  var bin = qs.bin;
  var filter;

  category = utils.formatName(type, category);

  utils.fetch(category, bin, function(e, trends) {
    if (e) return res.send(404, 'Error fetching distribution "' + category + '". Maybe you need to create it or increment a bin first, which creates the distribtion automatically, if it does not exists!');
    res.send(JSON.stringify(trends));
  });
}

module.exports = function(app) {
  app.get('/fetch', onFetch);
  app.get('/fetch/', onFetch);
};