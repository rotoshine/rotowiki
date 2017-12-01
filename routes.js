const routes = module.exports = require('next-routes')();

routes
  .add('documents', '/documents/:title');