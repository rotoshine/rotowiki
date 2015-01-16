'use strict';

angular.module('rotowikiApp')
  .controller('NavbarCtrl', function ($scope, $location, Auth) {
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
  });
