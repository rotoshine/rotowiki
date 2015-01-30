'use strict';

angular.module('rotowikiApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('document', {
        url: '/document/:title',
        templateUrl: 'app/document/document.html',
        controller: 'DocumentCtrl'
      })
      .state('document edit', {
        url: '/document-edit/:title',
        templateUrl: 'app/document/document-edit.html',
        controller: 'DocumentEditCtrl'
      })
      .state('random document', {
        url: '/document-random',
        controller: 'DocumentRandomCtrl'
      })
      .state('document all', {
        url: '/document-all',
        templateUrl: 'app/document/document-all.html',
        controller: 'DocumentAllCtrl'
      });
  });
