'use strict';

angular.module('rotowikiApp')
  .controller('MainCtrl', function ($scope, socket, Document) {
    $scope.recentDocuments = null;
    $scope.hotIssueDocuments = null;

    $scope.isNowRecentDocumenntsLoading = false;
    $scope.isNowHotIssueDocumentsLoading = false;


    $scope.init = function(){
      $scope.isNowRecentDocumentsLoading = true;
      $scope.isNowHotIssueDocumentsLoading = true;

      Document
        .query({
          page: 1,
          sort: 'updatedAt',
          pageCount: 20,
          asc: -1
        }, function(recentDocuments){
          $scope.isNowRecentDocumentsLoading = false;
          $scope.recentDocuments = recentDocuments;
        });

      Document
        .query({
          sort: 'readCount',
          asc: -1,
          page:1,
          pageCount: 20
        }, function(hotIssueDocuments){
          $scope.isNowHotIssueDocumentsLoading = false;
          $scope.hotIssueDocuments = hotIssueDocuments;
        });
    };

    /*socket.on('createDocument', function(document){
      alertify.success('새 문서가 생성되었습니다. ' + document.title);
    });*/
  });
