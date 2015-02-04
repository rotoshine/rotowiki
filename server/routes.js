/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');
var Browser = require('zombie');
var config = require('./config/environment');

module.exports = function(app) {
  // seo 처리
  /*app.get('*', function(req, res, next){
    if(req.query.hasOwnProperty('_escaped_fragment_')){
      var fullURL = config.domain + req.url.split('?')[0];
      console.log('크롤러 요청.' + fullURL);
      Browser.visit(fullURL, {
        debug: true,
        waitFor: 2000,
        loadCSS: true,
        runScripts: true
      }, function(e, browser, status){
        var html = browser.html();
        return res.send(html);
      })

    }else{
      return next();
    }
  });*/

  // Insert routes below
  app.use('/api/documentHistorys', require('./api/documentHistory'));
  app.use('/api/documents', require('./api/document'));
  app.use('/api/users', require('./api/user'));
  app.use('/auth', require('./auth'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendfile(app.get('appPath') + '/index.html');
    });
};
