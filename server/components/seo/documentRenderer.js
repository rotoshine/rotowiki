'use strict';

var Document = require('../../api/document/document.model');
var config = require('../../config/environment');
var querystring = require('querystring');
var marked = require('marked');
var striptags = require('striptags');

exports.render = function(url, res){
  return findDocumentByUrl(url, function(err, document){
    if(err){
      return res.send('올바르지 않은 페이지 요청입니다.' + err.message);
    }else if(document){
      return res.render('document.ejs', {
        document: document,
        wikiName: config.wikiName
      });
    }else{
      return res.render('documentNotFound.ejs', {
        wikiName: config.wikiName
      });
    }
  });
};

function findDocumentByUrl(url, callback){
  var query = null;
  var querystringStripedUrl = url.split('?')[0];
  if(url.indexOf('/document/') === 0){
    var title = querystringStripedUrl.replace('/document/', '');
    title = querystring.unescape(title);

    query = { title: title };
  }else if(querystringStripedUrl.indexOf('/document-by-id/') === 0){
    query = {_id: querystringStripedUrl.replace('/document-by-id/', '')};
  }

  if(query === null){
    return callback(null, new Error('url형식이 올바르지 않습니다 : ' + url));
  }else{
    return Document
      .findOne(query)
      .populate('files')
      .exec(function(err, document){
        if(err){
          return callback(err, null);
        }else if(document){
          if(document.content !== undefined && document.content !== ''){
            var content = marked(document.content);
            content = striptags(content);
            content = content.replace(/&amp;\[(\W.?)\]/mg, '$1');

            document.content = content;
          }else{
            document.content = '문서 내용이 없습니다.';
          }
          return callback(null, document);
        }else{
          // 문서가 없는 경우
          return callback(null, null);
        }
      });
  }
}

exports.findDocumentByUrl = findDocumentByUrl;
