'use strict';

angular.module('rotowikiApp')
  .controller('MainCtrl', function ($scope, socket, Document, WIKI_NAME) {
    window.document.title = WIKI_NAME;

    /*socket.on('createDocument', function(document){
      alertify.success('새 문서가 생성되었습니다. ' + document.title);
    });*/
  });
