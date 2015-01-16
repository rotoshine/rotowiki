'use strict';

angular.module('rotowikiApp')
  .controller('DocumentCtrl', function ($scope, Document, $stateParams) {
    $scope.title = $stateParams.title;
    $scope.isNotExistDocument = false;

    $scope.init = function(){
      Document
        .get({title: $scope.title})
        .$promise.then(function(document){
          console.log(arguments);
          $scope.document = document;
          console.log(document);
        }, function(err){
          if(err.status === 404){
            $scope.isNotExistDocument = true;
          }
        });
    };
  });
