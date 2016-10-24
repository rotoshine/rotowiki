/**
 * Main application routes
 */

'use strict';

const errors = require('./components/errors');
const fs = require('fs');

module.exports = function(app) {
  // Insert routes below
  app.use('/api/documentHistorys', require('./api/documentHistory'));
  app.use('/api/documents', require('./api/document'));
  app.use('/api/users', require('./api/user'));
  app.use('/auth', require('./auth'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  app.route('/*')
    .get(function(req, res) {
      return res.sendFile('../client/index.html');
  });
};
