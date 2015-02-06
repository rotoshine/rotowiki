/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');
var config = require('./config/environment');
var seoRenderer = require('./components/seo/documentRenderer');

module.exports = function(app) {
  // seo 처리
  app.get('*', function(req, res, next){
    if(req.query.hasOwnProperty('_escaped_fragment_')){
      // 임시처리
      if(req.url.indexOf('/document/') > -1){
        var title = req.url.split('?')[0].replace('/document/', '');
        return seoRenderer.render(title, res);
      }else{
        return next();
      }

      /*var browser = new Browser({
        waitFor: 2000,
        loadCSS: false,
        runScripts: true
      });

      var fullURL = config.domain + req.url.split('?')[0];

      console.log('크롤러 요청.' + fullURL);

      browser.visit(fullURL)
        .done(function(err){
          console.log(arguments);
          console.log('크롤러 요청 응답 결과 : ' + status + ', 요청 url : ' + fullURL);
          //var html = browser.html();
          return res.send('ok');
        });*/
    }else{
      return next();
    }
  });

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
