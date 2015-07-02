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

      console.log(documentTitlesCache);
      if(callback){
        return callback(err);
      }
    });
}
exports.loadDocumentTitlesCache = loadDocumentTitlesCache;

function apply(content){
  var LINK_WRAPPER_START = '&[';
  var LINK_WRAPPER_END = ']';
  var CARAGE_RETURN = '\n'
  if(documentTitlesCache.length > 0 && content !== ''){
    var documentTitle, regex;
    var contentByLine = content.split(CARAGE_RETURN);
    for(var i = 0; i < documentTitlesCache.length; i++){
      documentTitle = documentTitlesCache[i];

      // 2글자 이상의 단어만 링크를 만들자.
      if(documentTitle.length >= 2){
        // 개행문자 기준으로 쪼갠 뒤, 문서의 라인별로 indexOf한 단어 왼쪽으로 &[가 나오는지 살펴본다.
        // 나오지 않거나 ]가 나오면 링크 안 된 것으로 간주.
        for(var k = 0; k < contentByLine.length; k++){
          var workLine = contentByLine[k];
          if(workLine !== ''){
            var workLineTitleIndex = workLine.indexOf(documentTitle);
            if(workLineTitleIndex > -1){
              var notHasAlreadyLink = true;

              // 링ㅋ 텍스트 기준으로 왼쪽으로 이동해가며 2글자씩 추출.
              // 링크 시작 문법과 같은지 체크
              for(var s = workLineTitleIndex; s > 0; s--){
                var twoCharacters = workLine.substring(s - 2, s);
                if(twoCharacters === LINK_WRAPPER_START || twoCharacters === '(/'){
                  notHasAlreadyLink = false;
                  break;
                }
              }

              if(notHasAlreadyLink && workLineTitleIndex > -1){
                contentByLine[k] =
                  workLine.substring(0, workLineTitleIndex) +
                  LINK_WRAPPER_START +
                  documentTitle +
                  LINK_WRAPPER_END +
                  workLine.substring(workLineTitleIndex + documentTitle.length, workLine.length);
              }
            }
          }
        }
      }
    }

    return contentByLine.join(CARAGE_RETURN);
  }else{
    return content;
  }
}
exports.apply = apply;
