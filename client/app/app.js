'use strict';

angular.module('rotowikiApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'btford.socket-io',
  'ui.router',
  'ui.bootstrap',
  'angularFileUpload'
])
  .constant('WIKI_NAME', '로토위키')
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');

    $httpProvider.interceptors.push('authInterceptor');
  })
  .config(function(){
    moment.locale('ko');
  })
  .run(function($rootScope, $state, Auth){
    var keydownListeners = {
      mapper: {
        'navbar': new window.keypress.Listener(),
        'documentView': new window.keypress.Listener(),
        'documentEdit': new window.keypress.Listener()
      },
      stopAll: function(){
        for(var key in this.mapper){
          this.mapper[key].stop_listening();
        }
      },
      stop: function(mapperKey){
        if(this.mapper.hasOwnProperty(mapperKey)){
          this.mapper[mapperKey].stop_listening();
        }
      },
      listen: function(mapperKey){
        if(this.mapper.hasOwnProperty(mapperKey)){
          this.mapper[mapperKey].listen();
        }
      },
      addCombo: function(mapperKey, combo, callback){
        if(this.mapper.hasOwnProperty(mapperKey)){
          this.mapper[mapperKey].simple_combo(combo, callback);
        }
        return this;
      }
    };
    // keydown event
    keydownListeners
      .addCombo('navbar', 'm', function(){
        $state.go('main');
      })
      .addCombo('navbar', 'a', function(){
        $state.go('document all');
      })
      .addCombo('navbar', 'r', function(){
        $state.go('random document');
      })
      .addCombo('navbar', 'n', function(){
        $('.nav-create-document-button').click();
      })
      .addCombo('documentView', 'e', function(){
        if(Auth.isLoggedIn()){
          $('#document-edit-button').click();
        }
      })
      .addCombo('documentEdit', 'ctrl s', function(){
        $('#document-save-button').click();
      })
      .addCombo('documentEdit', 'esc', function(){
        history.back();
      })
      .addCombo('documentEdit', 'ctrl e', function(){
        $('#document-edit-tab a').click();
        $('#content').focus();
      })
      .addCombo('documentEdit', 'ctrl b', function(){
        $('#document-preview-tab a').click();
      });


    $rootScope.keydownListeners = keydownListeners;

    $rootScope.$on('$stateChangeStart', function (event, state) {
      keydownListeners.stopAll();
      if(state.allowKeydownListeners){
        for(var i = 0; i < state.allowKeydownListeners.length; i++){
          keydownListeners.listen(state.allowKeydownListeners[i]);
        }
      }
    });
  })
  .factory('authInterceptor', function ($rootScope, $q, $cookieStore, $location) {
    return {
      // Add authorization token to headers
      request: function (config) {
        config.headers = config.headers || {};
        if ($cookieStore.get('token')) {
          config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
        }
        return config;
      },

      // Intercept 401s and redirect you to login
      responseError: function(response) {
        if(response.status === 401) {
          $location.path('/');
          // remove any stale tokens
          $cookieStore.remove('token');
          return $q.reject(response);
        }
        else {
          return $q.reject(response);
        }
      }
    };
  })
  .filter('markdownToHTML', function(markdownService){
    return function(text){
      if(text !== undefined && text !== ''){
        return markdownService.toHTML(text);
      }else{
        return '';
      }
    }

  })
  .filter('toTrusted', function($sce){
    return function(text){
      if(text !== undefined && text !== ''){
        text = text
          .replace(/<script/, '')
          .replace(/<\/script>/, '');
        return $sce.trustAsHtml(text);
      }else{
        return '';
      }
    }
  })
  .filter('from', function(){
    return function(date){
      if(date !== undefined){
        var momentText = moment(date).from();
        if(momentText === '몇초 후'){
          momentText = '몇초 전';
        }
        return momentText;
      }else{
        return '';
      }
    }
  });
/*
  .run(function ($rootScope, $location, Auth) {
    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$stateChangeStart', function (event, next) {
      Auth.isLoggedInAsync(function(loggedIn) {
        if (next.authenticate && !loggedIn) {
          $location.path('/');
        }
      });
    });
  });*/

// jquery plugin
$.fn.selectRange = function(start, end) {
  if(!end){
    end = start;
  }
  return this.each(function() {
    if(this.setSelectionRange) {
      this.focus();
      this.setSelectionRange(start, end);
    } else if(this.createTextRange) {
      var range = this.createTextRange();
      range.collapse(true);
      range.moveEnd('character', end);
      range.moveStart('character', start);
      range.select();
    }
  });
};
