/**
This is not production ready stuff!!!
Prototyping
*/

var env = process.env;
var restify = require('restify');
var fs = require('fs');
var path = require('path');
var forgetsy = require('forgetsy-js');
var Delta = forgetsy.Delta;
var time = require(__dirname + '/lib/time');
var cluster = require('cluster');
var cpus = require('os').cpus().length;
var workers = [];
var sigint = false;
var logger = console;
var moment = require('moment');

env.APP_PID = path.resolve(__dirname + '/master.pid');

function create(category, time, cb) {
  Delta.create({
    name: category
    ,time: time
  }, cb);
}

function normalizeName(name) {
  return name.replace(/\W+/g, "").replace(/\s/g, "_");
}

function onCreate(req, res, next) {
  var qs = req.query;
  var category = qs.category;
  var keys = Object.keys(time);
  var len = keys.length;
  var count = 0;

  for (var i=0; i<len; i++) {
    Delta.create({
      name: keys[i] + '_' + category
      ,time: time[keys[i]]()
    }, function(e) {
      if (++count >= len) {
        res.send('Entry was created!');
      }
    });
  }
}

var increment = function(category, bin, incrementBy, cb) {
  Delta.get(category, function(e, delta) {
    if (e) return cb(e);

    delta.incr({
      bin: bin
      ,by: incrementBy
    }, function(e) {
      if (e) return cb(e);

      return cb(null);
    });
  })
};

/**
- Iterate the collection of category names
- Normalize the name by stripping non-alpha chars
  and replacing spaces with underscores
- Append the type to the categor name
- Increment the bin in each distribtion created
*/
function onIncrement(req, res, next) {
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
    var category = normalizeName(categories[i]);
    category = type + '_' + category;

    if (!category) continue;
    create(category, time.week(), function(e, delta) {
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

function onFetch(req, res, next) {
  var qs = req.query;
  if (!qs.category) return res.send(400, 'Missing one or more categories!');
  if (!qs.type) return res.send(400, 'Missing the category type!');

  var category = qs.category;
  var type = qs.type;
  var bin = qs.bin;
  var filter;

  category = type + '_' + normalizeName(category);

  Delta.get(category, function(e, delta) {
    var opts = {};
    if (bin) {
      opts.bin = req.params.bin
    }

    delta.fetch(opts, function(e, trends) {
      if (e) {
        res.send('Error fetching bin: ' + req.params.bin);
      } else {
        res.send(JSON.stringify(trends));

        next();
      }
    });
  });
}

var server = restify.createServer();
server.use(restify.queryParser());
server.use(restify.gzipResponse());

server.get('/create', onCreate);
server.get('/create/', onCreate);

server.get('/incr', onIncrement);
server.get('/incr/', onIncrement);

server.get('/fetch', onFetch);
server.get('/fetch/', onFetch);

/**
 * Spawns on or more worker nodes
 * @param null
 * @return void
 */
var spawn = function() {
  for (var i=0; i<cpus; i++) {
    var worker = cluster.fork({worker_id: i});
    workers.push(worker);
    worker.on('listening', function(addr) {
      logger.info('Cluster worker is now listening ', addr.address, ':', addr.port);
    }).on('online', function() {
      logger.info('Cluster worker is ready to do work!');
    });
  }
};

/**
 * Removes a worker from the pool of workers
 * @param  {Object} Worker object to remove
 * @return void
 */
var removeWorker = function(worker) {
  var len = workers.length;
  for (var i=0; i<len; i++) {
    var current = workers[i];
    if (current && current.pid === worker.pid) {
      workers[i] = null;
      workers.splice(i, 1);
      break;
    }
  }
};

/**
 * Stops the worker processes
 * @param null
 * @return void
 */
var stopWorkers = function() {
  workers.forEach(function(worker){
    logger.info("Sending STOP message to worker PID: " + worker.pid);
    worker.send({cmd: "stop"});
  });
};

if (cluster.isMaster && env.DEBUG !== "1") {
  spawn();
  cluster.on('exit', function(worker, code, sig) {
    logger.error('Cluster worker existed. Forking a new one...');
    cluster.fork();
  }).on('death', function(worker) {
    logger.error('Cluster work died... Creating a new one...');
    if (sigint) {
      logger.warn("SIGINT received! No workers will be spawned...");
    } else {
      removeWorker(worker);
      var newWorker = cluster.fork();
      workers.push(newWorker);
    }
  });

  process.on('SIGUSR2',function(){
      logger.warn("Received SIGUSR2 from system");
      logger.warn("There are " + workers.length + " workers running");
      stopWorkers();
  });

  process.on('SIGINT',function(){
      logger.warn('SIGINT issued! Terminating server...');
      sigint = true;
      process.exit();
  });
} else {
  server.listen(3000, function() {
    console.log('%s listening at %s', server.name, server.url);
  });
}

process.on('uncaughtException', function(err) {
  logger.error({err: err}, 'uncaught exception');
});