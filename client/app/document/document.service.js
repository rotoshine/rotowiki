'use strict';

angular.module('rotowikiApp')
  .factory('Document', function ($resource) {
    return $resource('/api/documents/:title', {
      title: '@title'
    }, {
      byId: {
        url: '/api/documents/by-id/:documentId',
        method: 'GET'
      },
      query: {
        url: '/api/documents',
        method: 'GET',
        isArray: true
      },
      save: {
        url: '/api/documents',
        method: 'POST'
      },
      random: {
        url: '/api/documents/random',
        method: 'GET'
      },
      recent: {
        url: '/api/documents?recent',
        method: 'GET',
        isArray: true
      },
      update: {
        method: 'PUT'
      }
    });
  });
