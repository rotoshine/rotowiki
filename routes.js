const routes = module.exports = require('next-routes')();

routes
  .add('index', '')
  .add('document', '/document/:title');