'use strict';

angular.module('rotowikiApp')
  .controller('MainCtrl', function ($scope, socket, $http) {
    $scope.recentDocuments = null;

    $http
      .get('/api/documents?recent')
      .success(function(recentDocuments){
        $scope.recentDocuments = recentDocuments;
      });

    /*socket.on('createDocument', function(document){
      alertify.success('새 문서가 생성되었습니다. ' + document.title);
    });*/
  });
