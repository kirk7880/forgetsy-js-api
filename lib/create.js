'use strict';

var env = process.env;
var utils = require(env.APP_LIB_DIR + '/utils');

function onCreate(req, res, next) {
  var qs = req.query;
  if (!qs.categories) return res.send(400, 'Missing one or more categories!');
  if (!qs.type) return res.send(400, 'Missing the category type!');

  var geoip = utils.geoip(req);
  var type = qs.type;
  
  var categories = qs.categories.split(',');
  categories = categories.concat(geoip);

  var len = categories.length;
  var count = 0;
  var create = function(idx) {
    if (idx >= len) return;

    var category = categories[idx];
    if (!category) return create(++count);

    category = utils.formatName(type, category);

    utils.create(category, utils.time.week(), utils.time.weeks(2), utils.time.weeksAgo(2))
      .then(function(delta) {
        create(++count);
      })
      .catch(function(e) {
        console.log('Create error', e)
        create(++count);
      });
  };

  create(count);

  res.send(200);
}

module.exports = function(app) {
  app.get('/create', onCreate);
  app.get('/create/', onCreate);
};