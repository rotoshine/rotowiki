'use strict';

var _ = require('lodash');
var Document = require('../../api/document/document.model');

var documentTitlesCache = [];
function documentTitlesCacheSort(){
  documentTitlesCache.sort(function(a, b){
    return b.length - a.length;
  });
}

function addDocumentTitlesCache(title){
  if(_.indexOf(documentTitlesCache, title) === -1){
    documentTitlesCache.push(title);
    documentTitlesCacheSort();
  }
}
exports.addDocumentTitlesCache = addDocumentTitlesCache;

function updateDocumentTitlesCache(updateBeforeTitle, updatedTitle){
  documentTitlesCache = _.reject(documentTitlesCache, function(title){
    return title === updateBeforeTitle
  });

  documentTitlesCache.push(updatedTitle);
  documentTitlesCacheSort();
}
exports.updateDocumentTitlesCache = updateDocumentTitlesCache;

function loadDocumentTitlesCache(callback){
  return Document
    .find({}, 'title')
    .exec(function(err, documents){
      if(err){
        if(callback){
          return callback(null);
        }
      }
      for(var i = 0; i < documents.length;i++){
        var document = documents[i];
        documentTitlesCache.push(document.title);
      }

      // 제목길이순으로 정렬
      documentTitlesCacheSort();

      if(callback){
        return callback(err);
      }
    });
}
exports.loadDocumentTitlesCache = loadDocumentTitlesCache;

function apply(content){
  if(documentTitlesCache.length > 0){
    var documentTitle, regex;
    for(var i = 0; i < documentTitlesCache.length; i++){
      documentTitle = documentTitlesCache[i];

      // 정규표현식! 짜릿해! 늘 새로워! 정규표현식이 최고야!
      content = content
                .replace(
                  // 공백이나 앞글자에 뭔가 글어간 경우...아래꺼랑 합칠 수 있음 좋겠다.
                  new RegExp('([^\[])(' + documentTitle + ')', 'g'), '$1&[$2]'
                )
                .replace(
                  new RegExp('(^' + documentTitle + ')', 'g'), '&[$1]'
                );
    }
    return content;
  }else{
    return content;
  }
}
exports.apply = apply;
