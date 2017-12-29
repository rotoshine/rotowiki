

const routes = module.exports = require('next-routes')();

routes
  .add('index', '/')
  .add('new-document', '/document/new')
  .add('document', '/document/:title');