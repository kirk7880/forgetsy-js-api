'use strict';

var utils = require(__dirname + '/utils');

function onCreate(req, res, next) {
  var qs = req.query;

  if (!qs.catrgory) return res.send(400, 'Missing distribution category name!');
  if (!qs.type) return res.send(400, 'Missing distribution type!');

  var category = qs.category;
  var type = qs.type;
  category = utils.formatName(type, category);
  utils.create(category, utils.time.week(), function(e, delta) {
  	if (e) return res.send(400, 'There was an error creating the distribution!');
  	res.send(200, 'Distribution was successfully created!');
  });
}

module.exports = function(app) {
  app.get('/create', onCreate);
	app.get('/create/', onCreate);
};