'use strict';

var Document = require('./document.model');

var documentTitlesCache = [];
function documentTitlesCacheSort(){
  documentTitlesCache.sort(function(a, b){
    return a.length < b.length;
  });
}

function addDocumentTitlesCache(title){
  documentTitlesCache.push(title);
  documentTitlesCacheSort();
}
exports.addDocumentTitlesCache = addDocumentTitlesCache;

function loadDocumentTitlesCache(callback){
  return Document
    .find({}, 'title')
    .exec(function(err, documents){
      if(err){
        return callback(null);
      }
      for(var i = 0; i < documents.length;i++){
        var document = documents[i];
        documentTitlesCache.push(document.title);
      }

      // 제목길이순으로 정렬
      documentTitlesCacheSort();

      console.log(documentTitlesCache);
      return callback(err);
    });
}
exports.loadDocumentTitlesCache = loadDocumentTitlesCache;

function autoLink(content){

}
exports.autoLink = autoLink;
