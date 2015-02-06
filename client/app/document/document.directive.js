'use strict';

angular.module('rotowikiApp')
  .directive('documentsWidget', function(){
    return {
      restrict: 'E',
      replace: true,
      scope: {
        heading: '@',
        querystring: '@',
        displayField: '@'
      },
      templateUrl: 'documentsWidget.html',
      controller: function($scope, Document){
        $scope.isNowLoading = true;
        $scope.documents = null;
        $scope.init = function(){
          var query = {};
          var params = $scope.querystring.split('&');

          for(var i = 0; i < params.length; i++){
            var keyAndValue = params[i].split('=');
            query[keyAndValue[0]] = keyAndValue[1];
          }
          Document
            .query(query)
            .$promise
            .then(function(documents){
              $scope.documents = documents;
              $scope.isNowLoading = false;
            })
        };
      }
    }
  });
