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
    if(req.query.hasOwnProperty('_escaped_fragment_=') || req.query.hasOwnProperty('_escaped_fragment_')){
      // 임시처리
      var url = req.url;
      if(url.indexOf('/document/') > -1){
        return seoRenderer.render(url, res);
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

  var fs = require('fs');
  var indexFile = fs.readFileSync(app.get('appPath') + '/main.html').toString();

  var ejs = require('ejs');
  var documentMeta = fs.readFileSync(__dirname + '/views/documentMeta.ejs').toString();

  var renderMainTemplate = function(json){
    var renderDocumentMeta = ejs.render(documentMeta, json);
    return indexFile.replace(/\{\{documentMeta}}/, renderDocumentMeta);
  };

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      var url = req.url;
      if(url.indexOf('/document/') > -1 || url.indexOf('/document-by-id/') > -1){
        return seoRenderer.findDocumentByUrl(url, function(err, document){
          if(document && document.content){
            document.content = document.content.substring(0, 200);
          }
          return res.send(renderMainTemplate(
            {
              document:document,
              documentUrl: config.domain + '/document-by-id/' + document._id,
              // 문서에서 이미지 얻어오자
              documentImageUrl: ''
            }
          ));
        });
      }else {
        return res.send(renderMainTemplate({
          document: {
            title: config.wikiName,
            content: 'SPA 방식으로 만들어진 위키 엔진'
          },
          documentUrl: config.domain,
          documentImageUrl: ''
        }));
      }
    });
};
