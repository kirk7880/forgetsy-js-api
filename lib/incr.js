'use strict';

var utils = require(__dirname + '/utils');

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

  var categories = qs.categories.split(',');
  var type = qs.type;
  var bin = qs.bin;
  var incrementBy = parseInt(qs.by, 10);
  incrementBy = (incrementBy > 0) ? incrementBy : 1;

  var len = categories.length;
  var count = 0;

  for (var i=0; i<len; i++) {
    var category = categories[i];
    if (!category) continue;

    category = utils.formatName(type, category);
     
    utils.create(category, utils.time.week(), function(e, delta) {
      if (delta) {
        delta.incr({
          bin: bin
          ,by: incrementBy
        }, function(e) {})
      } 
    });
  }

  res.send(200);
}

module.exports = function(app) {
  app.get('/incr', onIncr);
  app.get('/incr/', onIncr);
};