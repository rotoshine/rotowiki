'use strict';

angular.module('rotowikiApp')
  .controller('NavbarCtrl', function ($scope, $location, Auth, Document) {
    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.getCurrentUser = Auth.getCurrentUser;
    $scope.menu = [
      {
        title: '전체보기',
        link: '/document-all'
      }
    ];
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
              if(document){
                alertify.alert('해당 제목의 문서가 이미 존재합니다.');
              }
            }, function(){
              Document.save({
                title: title
              }, function(){
                location.href = '/document-edit/' + title;
              });
            });
        }
      });
    };

    $scope.searchService = {
      isShow: false,
      isNowSearching: false,
      searchResult: null,
      searchKeyword: '',
      showResult: function(){
        this.isShow = true;
      },
      hideResult: function(){
        this.isShow = false;
      },
      search: function($event){
        var that = this;

        if(this.searchKeyword !== undefined && this.searchKeyword.length > 1){
          $scope.isCollapsed = true;
          this.isNowSearching = true;
          this.showResult();

          Document
            .query({title: this.searchKeyword})
            .$promise.then(function(documents){
              that.searchResult = documents;
              that.isNowSearching = false;
            }, function(){
              that.searchResult = [];
              that.isNowSearching = false;
            });
        }else{
          alertify.alert('검색어는 2글자 이상 입력해주세요.');
        }
        $event.preventDefault();
        $event.stopPropagation();
      }
    };
  });
