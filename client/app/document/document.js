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
      });
  });
