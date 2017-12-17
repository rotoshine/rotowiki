const routes = module.exports = require('next-routes')();

routes
  .add('index', '')
  .add('random', '/document/random')
  .add('document', '/document/:title');
  