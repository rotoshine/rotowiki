const app = require('./app')();

if(process.env.NODE_ENV === 'production'){
  // Start server
  app.listen(config.port, config.ip, function () {
    console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
  });
}
