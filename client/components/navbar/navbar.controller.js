'use strict';

angular.module('rotowikiApp')
  .controller('NavbarCtrl', function ($scope, $location, Auth, Document) {
    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.getCurrentUser = Auth.getCurrentUser;

    $scope.logout = function() {
      Auth.logout();
      $location.path('/');
    };

    $scope.goLogin = function(){
      location.href = '/auth/twitter';
    };

    $scope.isActive = function(route) {
      return route === $location.path();
    };

    $scope.createDocument = function(){
      alertify.prompt('새로 만들 문서 제목을 입력해주세요.', function(answer, title){
        if(answer){
          Document
            .get({title: title})
            .$promise.then(function(document){
              alert('11');
              if(document){
                alertify.alert('해당 제목의 문서가 이미 존재합니다.');
              }
            }, function(){
              location.href = '/document-edit/' + title;
            });
        }
      });
    };
  });
