'use strict';

angular.module('rotowikiApp')
  .controller('NavbarCtrl', function ($scope, $state, $location, Auth, Document, $timeout, $rootScope, $modal, LAST_VISIT_URL_KEY) {
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
      if(window.localStorage && window.localStorage[LAST_VISIT_URL_KEY]){
        window.localStorage.removeItem(LAST_VISIT_URL_KEY);
      }
      Auth.logout();
      $location.path('/');
    };

    $scope.goLogin = function(){
      if(window.localStorage){
        window.localStorage.setItem(LAST_VISIT_URL_KEY, location.href);
      }
      location.href = '/auth/twitter';
    };

    $scope.isActive = function(route) {
      return route === $location.path();
    };

    $scope.keydownListeners = $rootScope.keydownListeners;

    $scope.nowShowCreateDocumentPrompt = false;
    $scope.createDocument = function(){
      if(!$scope.nowShowCreateDocumentPrompt){
        $scope.keydownListeners.stop('navbar');
        $scope.nowShowCreateDocumentPrompt = true;

        alertify.prompt('새로 만들 문서 제목을 입력해주세요.', function(answer, title){
          $scope.nowShowCreateDocumentPrompt = false;
          $scope.keydownListeners.listen('navbar');
          if(answer){
            if(title.length > 0){
              Document
                .get({title: title})
                .$promise.then(function(document){
                  if(document){
                    alertify.alert('해당 제목의 문서가 이미 존재합니다.');
                  }
                }, function(){
                  // 문서를 생성한 후 문서 편집으로 이동.
                  Document.save({
                    title: title
                  }, function(){
                    $state.go('document edit', {title: title});
                  });
                });
            }else{
              alertify.alert('문서 제목은 1글자 이상 입력해주세요.');
            }
          }
        });
      }
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

    $scope.showShortcut = function(){
      $modal.open({
        templateUrl: 'shortcut-modal.html',
        controller: 'ShortcutModalCtrl'
      });
    };
  })
  .controller('ShortcutModalCtrl', function($scope, $modalInstance){
    $scope.close = function(){
      $modalInstance.close();
    };
  });
