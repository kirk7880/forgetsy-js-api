'use strict';

var forgetsy = require('forgetsy-js');
var Delta = forgetsy.Delta;
var geoip = require('geoip-lite');
var env = process.env;

exports.time = require(env.APP_LIB_DIR + '/time');

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
exports.create = function(category, time, secondaryTime, secondaryDate, cb) {
  Delta.get(category, function(e, delta) {
    if (e) {
      Delta.create({
        name: category
        ,time: time
        ,secondaryTime: secondaryTime
        ,secondaryDate: secondaryDate
      }, cb);
    } else {
      cb(e, delta);
    }
  })
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

exports.fetch = function(category, opts, cb) {
  Delta.get(category, function(e, _delta) {
    if (e) return cb(e);
    _delta.fetch({bin: opts.bin, limit: opts.limit}, cb);
  });
};

/**
Converts a numberically indexed arrays' values
to object keys
@param {Array} filters
@return {Object}
*/
exports.convertFilterValuesTokeys = function(filters) {
  var len = filters.length;
  var obj = {};
  for (var i=0; i<len; i++) {
    obj[filters[i]] = true;
  }

  return obj;
}

/**
If set, convert the filter
list to an object so we can 
omit specific types of collections
to the result set. 

The request can indicate items
to filter out. For example, if
we do not care about trending 
items in the users' location,
we can filter out all geopip
related trends:
?filters=geoip
?filters=geoip_country
?filters=geoip_region
?filters=geoip_city
?filters=geoip_city,geoip_region
...

@param {Array} filters
@return {Object}
*/
exports.setRequestFilters = function(filters) {
  var _filters = {};
  if (filters) {
    _filters = exports.convertFilterValuesTokeys(filters.split(','));
  }

  return _filters;
};

/**
Determines the users' location
and create a distribtion for
that country, region and 
city.

@param {Object} req The request object
@return {Array}
*/
exports.geoip = function(req, filters) {
  var ip = req.ips;
  if (ip && ip.length <= 0) {
    ip = req.ip;
  }

  var res = [];

  filters = filters || {};

  // hard-coded for testing...
  // @TODO Remove this
  var geo = geoip.lookup(ip || "108.27.217.214");

  if (geo && !filters['geoip']) {
    if (geo.country && !filters['geoip_country']) {
      res.push('country_' + geo.country);
    }

    if (geo.region && !filters['geoip_region']) {
      res.push('region_' + geo.region);
    }

    if (geo.city && !filters['geoip_city']) {
      res.push('city_' + geo.city);
    }
  }
  
  return res;
};