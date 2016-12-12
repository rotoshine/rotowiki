module.exports = (app) => {
  'use strict';

  process.env.NODE_ENV = process.env.NODE_ENV || 'development';

  var express = require('express');
  var mongoose = require('mongoose');
  var config = require('./config/environment');

// Connect to database
  mongoose.connect(config.mongo.uri, config.mongo.options);

// Setup server
  if(!app){
    app = express();
  }
  var server = require('http').createServer(app);
  var socketio = require('socket.io')(server, {
    serveClient: (config.env === 'production') ? false : true,
    path: '/socket.io-client'
  });
  require('./config/socketio')(socketio);
  require('./config/express')(app);
  require('./routes')(app);
};



