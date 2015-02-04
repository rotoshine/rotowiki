'use strict';

angular.module('rotowikiApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('document', {
        url: '/document/:title',
        templateUrl: 'app/document/document.html',
        controller: 'DocumentCtrl',
        allowKeydownListeners: ['navbar', 'documentView']
      })
      .state('document by id', {
        url: '/document/by-id/:documentId',
        controller: 'DocumentRedirectionCtrl'
      })
      .state('document edit', {
        url: '/document-edit/:title',
        templateUrl: 'app/document/document-edit.html',
        controller: 'DocumentEditCtrl',
        allowKeydownListeners: ['documentEdit']
      })
      .state('random document', {
        url: '/document-random',
        controller: 'DocumentRandomCtrl'
      })
      .state('document all', {
        url: '/document-all',
        templateUrl: 'app/document/document-all.html',
        controller: 'DocumentAllCtrl',
        allowKeydownListeners: ['navbar']
      });
  });
