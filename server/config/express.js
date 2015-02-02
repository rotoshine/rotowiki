/**
 * Express configuration
 */

'use strict';

var express = require('express');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var compression = require('compression');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var errorHandler = require('errorhandler');
var path = require('path');
var config = require('./environment');
var passport = require('passport');
var session = require('express-session');
var mongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');
var multer = require('multer');
var fs = require('fs');

module.exports = function(app) {
  var env = app.get('env');

  app.set('views', config.root + '/server/views');
  app.engine('html', require('ejs').renderFile);
  app.set('view engine', 'html');
  app.use(compression());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(methodOverride());
  app.use(cookieParser());
  app.use(passport.initialize());

  console.log('업로드 파일 크기:' + config.maxUploadFileSize);
  app.use(multer({
    dest: config.uploadPath,
    limits: {
      fileSize: config.maxUploadFileSize
    },
    rename: function(fieldName, fileName){
      return fileName.replace(/\W+/g, '-').toLowerCase() + Date.now();
    },
    onError: function(err, next){
      console.log(err);
      next(err);
    },
    onFileSizeLimit: function(file){
      // TODO 왜 작동을 안 하지????
      cosole.log(file);
    },
    onFileUploadComplete: function(file){
      // onFileSizeLimit이 제대로 작동하지 않아 이런 식으로 처리함.
      if(file.size > config.maxUploadFileSize){
        console.log('용량초과 파일!' + file.originalname + ' 삭제 개시');
        return fs.unlink(file.path);
      }
    }
  }));
  // Persist sessions with mongoStore
  // We need to enable sessions for passport twitter because its an oauth 1.0 strategy
  app.use(session({
    secret: config.secrets.session,
    resave: true,
    saveUninitialized: true,
    store: new mongoStore({ mongoose_connection: mongoose.connection })
  }));

  if ('production' === env) {
    app.use(favicon(path.join(config.root, 'public', 'favicon.ico')));
    app.use(express.static(path.join(config.root, 'public')));
    app.set('appPath', config.root + '/public');
    app.use(morgan('dev'));
  }

  if ('development' === env || 'test' === env) {
    app.use(require('connect-livereload')());
    app.use(express.static(path.join(config.root, '.tmp')));
    app.use(express.static(path.join(config.root, 'client')));
    app.set('appPath', 'client');
    app.use(morgan('dev'));
    app.use(errorHandler()); // Error handler - has to be last
  }
};
