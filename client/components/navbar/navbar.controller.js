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
      }/*,
      {
        title: '문서목록',
        link: '/document-list'
      }*/
    ];

    $scope.selectedThemeName = null;

    $scope.themes = [
      {
        name: 'default',
        cssUrl: ''
      },
      {
        name: 'cerulean',
        cssUrl: 'https://bootswatch.com/cerulean/bootstrap.min.css'
      },
      {
        name: 'cosmo',
        cssUrl: 'https://bootswatch.com/cosmo/bootstrap.min.css'
      },
      {
        name: 'cyborg',
        cssUrl: 'https://bootswatch.com/cyborg/bootstrap.min.css'
      },
      {
        name: 'darkly',
        cssUrl: 'https://bootswatch.com/darkly/bootstrap.min.css'
      },
      {
        name: 'flatly',
        cssUrl: 'https://bootswatch.com/flatly/bootstrap.min.css'
      },
      {
        name: 'journal',
        cssUrl: 'https://bootswatch.com/journal/bootstrap.min.css'
      },
      {
        name: 'lumen',
        cssUrl: 'https://bootswatch.com/lumen/bootstrap.min.css'
      },
      {
        name: 'paper',
        cssUrl: 'https://bootswatch.com/paper/bootstrap.min.css'
      },
      {
        name: 'readable',
        cssUrl: 'https://bootswatch.com/readable/bootstrap.min.css'
      },
      {
        name: 'sandstone',
        cssUrl: 'https://bootswatch.com/sandstone/bootstrap.min.css'
      },
      {
        name: 'simplex',
        cssUrl: 'https://bootswatch.com/simplex/bootstrap.min.css'
      },
      {
        name: 'slate',
        cssUrl: 'https://bootswatch.com/slate/bootstrap.min.css'
      },
      {
        name: 'spacelab',
        cssUrl: 'https://bootswatch.com/spacelab/bootstrap.min.css'
      },
      {
        name: 'superhero',
        cssUrl: 'https://bootswatch.com/superhero/bootstrap.min.css'
      },
      {
        name: 'united',
        cssUrl: 'https://bootswatch.com/united/bootstrap.min.css'
      },
      {
        name: 'yeti',
        cssUrl: 'https://bootswatch.com/yeti/bootstrap.min.css'
      }
    ];

    var THEME_KEY = 'selectedTheme';

    $scope.changeTheme = function(theme, $event){
      if($event !== undefined){
        $event.preventDefault();
      }
      $('#themeCSS').attr('href', theme.cssUrl);

      $scope.selectedThemeName = theme.name;
      localStorage.setItem(THEME_KEY, JSON.stringify({
        name: theme.name,
        cssUrl: theme.cssUrl
      }));
    };

    $scope.loadSavedTheme = function(){
      var savedTheme = localStorage.getItem(THEME_KEY);

      // local storage에서 선택된 테마가 있는지 체크
      if(savedTheme !== undefined){
        $scope.changeTheme(JSON.parse(savedTheme));
      }else{
        $scope.selectedThemeName = 'default';
      }
    };

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
            if(/[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%\\\=\(\'\"]/gi.test(title)){
              return alertify.alert('허용되지 않는 문자열이 포함되어 있습니다.<br>' +
                '?, !와 같은 기호는 뺴고 넣어주세요.<br>' +
                '안 그러면 개발자 힘들다.');
            }else if(title.length > 0){
              // &는 허용문자이지만 제목이 들어가있으면 entity로 치환환
              title = title.replace(/&/g, '&amps');
              Document
                .get({title: title})
                .$promise.then(function(document){
                  if(document){
                    return alertify.alert('해당 제목의 문서가 이미 존재합니다.');
                  }
                }, function(){
                  // 문서를 생성한 후 문서 편집으로 이동.
                  return Document.save({
                    title: title
                  }, function(){
                    $state.go('document edit', {title: title});
                  });
                });
            }else{
              return alertify.alert('문서 제목은 1글자 이상 입력해주세요.');
            }
          }
        });
      }
    };

    // android에서 backbutton touch 시 검색결과 무조건 숨기게 하기
    document.addEventListener('backbutton', function(e){
      if($scope.searchService.isShow){
        e.preventDefault();
        $scope.searchService.hideResult();
      }
    }, false);
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

        var SEARCH_KEYWORD_MIN_LENGTH = 1;
        if(this.searchKeyword !== undefined && this.searchKeyword.length >= SEARCH_KEYWORD_MIN_LENGTH){
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
          alertify.alert('검색어는 ' + SEARCH_KEYWORD_MIN_LENGTH + '글자 이상 입력해주세요.');
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

    $scope.init = function(){
      $scope.loadSavedTheme();
    };
  })
  .controller('ShortcutModalCtrl', function($scope, $modalInstance){
    $scope.close = function(){
      $modalInstance.close();
    };
  });
