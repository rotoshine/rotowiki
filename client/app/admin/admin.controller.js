'use strict';

angular.module('rotowikiApp')
  .controller('AdminCtrl', function ($scope, $state, Auth, User) {

    if(!Auth.isAdmin()){
      alertify.alert('권한이 없습니다.');
      $state.go('main');
    }
    // Use the User $resource to fetch all users
    $scope.users = User.query();

    $scope.delete = function(user) {
      User.remove({ id: user._id });
      angular.forEach($scope.users, function(u, i) {
        if (u === user) {
          $scope.users.splice(i, 1);
        }
      });
    };
  });
