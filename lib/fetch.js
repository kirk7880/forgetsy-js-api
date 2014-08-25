'use strict';

var env = process.env;
var utils = require(env.APP_LIB_DIR + '/utils');
var Promise = require('es6-promise').Promise;

function fetch(category, opts, cb) {
  return new Promise(function(resolve, reject) {
    utils.fetch(category, opts)
      .then(function(trends) {
        console.log(trends);
        resolve({category: category, trends: trends})
      })
      .catch(function(e) {
        reject(e);
      })
  });
}

function onFetch(req, res, next) {
  var qs = req.query;
  if (!qs.categories) return res.send(400, 'Missing one or more categories!');
  if (!qs.type) return res.send(400, 'Missing the category type!');

  var filters = {};
  var opts = {};

  if (qs.filters) {
    filters = utils.setRequestFilters(qs.filters);
  }

  if (qs.bin) {
    opts.bin = qs.bin;
  }

  if (qs.limit) {
    opts.limit = parseInt(qs.limit, 10);
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

  var check = function() {
    if (++count >= len) {
      res.status(200).send(results);
    }
  }

  for (var i=0; i<len; i++) {
    var category = categories[i];
    if (!category) continue;

    category = utils.formatName(type, category);
    
    fetch(category, opts)
      .then(function(res) {
        results[res.category] = res.trends;
        check();
      })
      .catch(function(e) {
        check();
      })
  }
}

module.exports = function(app) {
  app.get('/fetch', onFetch);
  app.get('/fetch/', onFetch);
};