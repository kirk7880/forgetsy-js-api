/**
This is not production ready stuff!!!
Prototyping
*/
var env = process.env;
var connect = require('connect');
var validator = require('express-validator');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var esession = require('express-session');
var cookieParser = require('cookie-parser');
var csrf = require('csurf');
var cors = require('cors');
var path = require('path');
var express = require('express');
var app  = express();
var fs = require('fs');
var path = require('path');
var cluster = require('cluster');
var cpus = require('os').cpus().length;
var workers = [];
var sigint = false;
var logger = console;
var moment = require('moment');

// set the logger in the module
app.logger = logger;
app.enable('trust proxy');
app.use(bodyParser());
app.use(connect.logger());
app.use(connect.urlencoded());
app.use(connect.json()); 
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(cookieParser());
app.use(esession({secret: env.APP_SESSION_SECRET}));
app.use(csrf());
app.use(connect.compress());
app.use(validator());
app.use(cors());

// routers
require(env.APP_LIB_DIR + '/incr')(app);
require(env.APP_LIB_DIR + '/create')(app);
require(env.APP_LIB_DIR + '/fetch')(app);

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
      logger.warn('SIGINT issued! Terminating app...');
      sigint = true;
      process.exit();
  });
} else {
  app.listen(3000, function() {
    console.log('%s listening at %s', app.name, app.url);
  });
}

process.on('uncaughtException', function(err) {
  logger.error({err: err}, 'uncaught exception');
});