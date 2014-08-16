'use strict';

var forgetsy = require('forgetsy-js');
var Delta = forgetsy.Delta;
var geoip = require('geoip-lite');

exports.time = require(__dirname + '/time');

/**
Normalizes the category name by removing
non-alphanumerical characters and
replacing \s [spaces] with underscores.
@param {String} name Category name
@return {String} the normalized name
*/
exports.normalizeName = function(name) {
  return name.replace(/\W+/g, "").replace(/\s/g, "_");
};

/**
Formats the category distribution name
by concatenating the type & the category
using an underscore. The type and name
strings are first normalized before 
joining.
@param {String} type Type of distribution
@param {String} name Name of distribution
@return {String}
*/
exports.formatName = function(type, name) {
	return exports.normalizeName(type.toLowerCase()) + '_' + exports.normalizeName(name.toLowerCase());
};

/**
Creates a new categorial distribution
@param {String} category Name of distribution
@param {Number} time The window of time to trend
@param {Function} cb The function to invoke after
	processing completes
@return void
*/
exports.create = function(category, time, cb) {
  Delta.create({
    name: category
    ,time: time
  }, cb);
}

/**
Increments a specific bin by n. 
@param {String} category Name of category
	the bin belongs to (ie: food)
@param {Mixed} bin The bin to increment (ie: <item id>)
@param {Number} incrementBy The value to increment the bin by
@param {Function} cb The function to invoke after processing
@return void
*/
exports.increment = function(category, bin, incrementBy, cb) {
  Delta.get(category, function(e, delta) {
    if (e) return cb(e);

    delta.incr({
      bin: bin
      ,by: incrementBy
    }, function(e) {
      if (e) return cb(e);

      return cb(null);
    });
  });
};

exports.fetch = function(category, bin, cb) {
	Delta.get(category, function(e, delta) {
		if (e) return cb(e);
		
    var opts = {};
    if (bin) {
      opts.bin = req.params.bin
    }

    delta.fetch(opts, cb);
  });
};

/**
Determines the users' location
and create a distribtion for
that country, region and 
city.

@param {Object} req The request object
@return {Array}
*/
exports.geoip = function(req) {
	var ip = req.ips;
  if (ip && ip.length <= 0) {
    ip = req.ip;
  }

  var res = [];

  // hard-coded for testing...
  var geo = geoip.lookup("108.27.217.214");

  console.log('GEO', geo);

  if (geo) {
  	if (geo.country) {
  		res.push(geo.country);
  	}

  	if (geo.region) {
  		res.push(geo.region);
  	}

  	if (geo.city) {
  		res.push(geo.city);
  	}
  }
  
  return res;
};