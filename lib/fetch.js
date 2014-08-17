'use strict';

var env = process.env;
var utils = require(env.APP_LIB_DIR + '/utils');

function fetch(category, bin, cb) {
  utils.fetch(category, bin, function(e, trends) {
    cb(e, category, trends);
  });
}

function onFetch(req, res, next) {
  var qs = req.query;
  if (!qs.categories) return res.send(400, 'Missing one or more categories!');
  if (!qs.type) return res.send(400, 'Missing the category type!');

  var filters = {};

  if (qs.filters) {
    filters = utils.setRequestFilters(qs.filters);
  }

  var categories = qs.categories.split(',');
  var geoip = utils.geoip(req, filters);
  
  if (geoip) {
    categories = categories.concat(geoip);
  }

  var type = qs.type;
  var bin = qs.bin;
  var len = categories.length;
  var count = 0;
  var results = {};
  for (var i=0; i<len; i++) {
    var category = categories[i];
    if (!category) continue;

    category = utils.formatName(type, category);
    fetch(category, bin, function(e, _category, trends) {
      results[_category] = (e !== null) ? [] : trends;
      if (++count >= len) {
        res.status(200).send(results);
      }
    });
  }
}

module.exports = function(app) {
  app.get('/fetch', onFetch);
  app.get('/fetch/', onFetch);
};