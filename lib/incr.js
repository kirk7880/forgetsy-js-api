'use strict';

var env = process.env;
var utils = require(env.APP_LIB_DIR + '/utils');

/**
- Iterate the collection of category names
- Normalize the name by stripping non-alpha chars
  and replacing spaces with underscores
- Append the type to the categor name
- Increment the bin in each distribtion created
@param {Object} req Request object
@param {Object} res Response Object
@param {Function} next Function to invoke next
@retur void
*/
function onIncr(req, res, next) {
  var qs = req.query;
  if (!qs.categories) return res.send(400, 'Missing one or more categories!');
  if (!qs.type) return res.send(400, 'Missing the category type!');
  if (!qs.bin) return res.send(400, 'Missing bin to increment!');

  var geoip = utils.geoip(req);
  var type = qs.type;
  var bin = qs.bin;
  var count = 0;
  var incrementDate = new Date().getTime();
  
  var categories = qs.categories.split(',');
  categories = categories.concat(geoip);

  if (qs.dateValue && qs.dateType) {
    incrementDate = utils.time[qs.dateType](qs.dateValue);
  }

  var incrementBy = parseInt(qs.by, 10);
  incrementBy = (incrementBy > 0) ? incrementBy : 1;

  var len = categories.length;
  var count = 0;
  var increment = function(idx) {
    if (idx >= len) return;

    var category = categories[idx];
    if (!category) return increment(++count);

    category = utils.formatName(type, category);

    utils.create(category, utils.time.week(), utils.time.weeks(2), utils.time.weeksAgo(2))
      .then(function(delta) {
        utils.increment(category, bin, incrementBy, incrementDate)
          .then(function(res) {
            increment(++count);
          })
          .catch(function(e) {
            increment(++count);
          });
      })
      .catch(function(e) {
        increment(++count);
      });
  };

  increment(count);

  res.send(200);
}

module.exports = function(app) {
  app.get('/incr', onIncr);
  app.get('/incr/', onIncr);
};