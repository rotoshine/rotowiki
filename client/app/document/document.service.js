'use strict';

angular.module('rotowikiApp')
  .factory('Document', function ($resource) {
    return $resource('/api/documents/:title', {
      recent: {
        method: 'GET',
        isArray: true
      }
    });
  });
