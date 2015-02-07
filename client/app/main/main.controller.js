'use strict';

angular.module('rotowikiApp')
  .controller('MainCtrl', function ($scope, socket, Document, WIKI_NAME, LAST_VISIT_URL_KEY) {
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

    /*socket.on('createDocument', function(document){
      alertify.success('새 문서가 생성되었습니다. ' + document.title);
    });*/
  });
