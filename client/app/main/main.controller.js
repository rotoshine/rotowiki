'use strict';

angular.module('rotowikiApp')
  .controller('MainCtrl', function ($scope, Document, WIKI_NAME, LAST_VISIT_URL_KEY, socket, markdownService) {
    window.document.title = WIKI_NAME;

    // 마지막으로 방문한 페이지가 있을 경우 거기로 리다이렉트.
    // 로그인 사후처리...같은 것...
    if(window.localStorage){
      var lastVisitUrl = window.localStorage[LAST_VISIT_URL_KEY];
      if(lastVisitUrl){
        window.localStorage.removeItem(LAST_VISIT_URL_KEY);
        location.href = lastVisitUrl;
      }
    }

    $scope.randomDocument = null;
    $scope.isSuccessGettingRandomDocument = false;

    var MAX_RANDOM_DOCUMENT_GET_TRY_COUNT = 10;
    var randomDocumentTryCount = 0;

    var randomDocumentCallback = function(document){
      var isContentEmpty = document === undefined || document.content === undefined;
      if(randomDocumentTryCount >= MAX_RANDOM_DOCUMENT_GET_TRY_COUNT){
        $scope.randomDocument = {
          title: '이럴수가!',
          content: '무작위로 문서를 가져오려고 했는데 가져오는 문서가 족족 빈 문서네요. 이러기도 쉽지 않은데...로또라도 사보심이..?'
        };
      }
      else if(isContentEmpty){
        randomDocumentTryCount = randomDocumentTryCount + 1;
        Document
          .random(randomDocumentCallback);
      }else{
        var MAX_CONTENT_LENGTH = 40
        if(document.content !== undefined && document.content.length > MAX_CONTENT_LENGTH){
          document.content = document.content.substring(0, MAX_CONTENT_LENGTH) + '..';
          document.content = markdownService.toHTML(document.content);
        }

        $scope.isSuccessGettingRandomDocument = true;
        $scope.randomDocument = document;
      }
    };

    Document
      .random(randomDocumentCallback);
      
    socket.socket.on('document:create', function(document){
      alertify.log(document.title + ' 문서가 생성되었습니다.', 'success', 5000);
    });
    /*socket.on('createDocument', function(document){
      alertify.success('새 문서가 생성되었습니다. ' + document.title);
    });*/
  })
  .controller('FooterCtrl', function($scope){
    $scope.hello = 'world';
  });
