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
          if($scope.querystring !== undefined){
            var params = $scope.querystring.split('&');

            for(var i = 0; i < params.length; i++){
              var keyAndValue = params[i].split('=');
              query[keyAndValue[0]] = keyAndValue[1];
            }
          }
          Document
            .query(query)
            .$promise
            .then(function(documents){
              $scope.documents = documents;
              $scope.isNowLoading = false;
            });
        };
      }
    };
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
    };
  })
  .directive('document', function($compile){
    return function(scope, element, attrs){
      scope.$watch(function(scope){
        return scope.$eval(attrs.content);
      },
      function(value){
        element.html(value);

        $compile(element.contents())(scope);
      });
    };
  })
  .directive('discography', function(){
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        name: '@',
        releaseDate: '@',
        thumbnailUrl: '@'
      },
      templateUrl: 'discography.html'
    };
  })
  .directive('documentList', function(){
    return {
      replace: true,
      restrict: 'E',
      scope: {
        documents: '@'
      },
      templateUrl: 'document-list.html'
    }
  })
  .directive('embedTwit', function(){
    return {
      replace: true,
      restrict: 'E',
      scope: {
        url: '@'
      },
      controller: function($scope, $http, $sce){
        $http
          .get('/api/documents/sns/twitter/embed-twit?url='+$scope.url)
          .then(function(embedTwitJSON){
            if(embedTwitJSON && embedTwitJSON.data && embedTwitJSON.data.html){
              $scope.embedTwit = $sce.trustAsHtml(embedTwitJSON.data.html);
            }
          });
      },
      template: '<div class="embed-twit" ng-bind-html=embedTwit></div>'
    }
  });
