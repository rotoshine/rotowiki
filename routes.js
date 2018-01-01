

const routes = module.exports = require('next-routes')();

routes
  .add('index', '/')
  .add('new-document', '/document/new')
  .add('document', '/document/:title')
  .add('random-document', '/document/random')
  .add('loginFail', '/error/login-fail', 'error/LoginFail');
