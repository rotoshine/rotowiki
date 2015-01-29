'use strict';

angular.module('rotowikiApp')
  .controller('MainCtrl', function ($scope, socket, Document) {
    $scope.recentDocuments = null;

    Document
      .query({
        recent: true,
        page: 1,
        sort: 'createdAt',
        asc: -1
      }, function(recentDocuments){
        $scope.recentDocuments = recentDocuments;
      });

    /*socket.on('createDocument', function(document){
      alertify.success('새 문서가 생성되었습니다. ' + document.title);
    });*/
  });
