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
      like: {
        url: '/api/documents/:title/like',
        method: 'POST'
      },
      unlike: {
        url: '/api/documents/:title/like',
        method: 'DELETE'
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
      },
      findByNoParents: {
        url: '/api/documents?hasNoParent=true&sort=title&hasSubDocumentCount=true',
        method: 'GET',
        isArray: true
      },
      findFiles: {
        url: '/api/documents/by-id/:documentId/files',
        method: 'GET',
        isArray: true
      },
      removeFile: {
        url: '/api/documents/by-id/:documentId/files/:fileId',
        method: 'DELETE'
      }
    });
  });
