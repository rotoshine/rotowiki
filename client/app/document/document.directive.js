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
  })
  .directive('info', function(){
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: {
        type: '@'
      },
      templateUrl: 'info.html',
      controller: function($scope){
        $scope.alertTypeClass = 'alert-info';

        if($scope.type){
          $scope.alertTypeClass = 'alert-' + $scope.type;
        }
      }
    }
  })
  .directive('document', function($compile){
    return function(scope, element, attrs){
      scope.$watch(function(scope){
        return scope.$eval(attrs.content);
      },
      function(value){
        element.html(value);

        $compile(element.contents())(scope);
      })
    }
  });
