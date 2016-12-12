'use strict';

const webpack = require('webpack');
const express = require('express');
const fs = require('fs');

const webpackConfig = require('./webpack.dev.js');
const compiler = webpack(webpackConfig);
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const host = 'localhost';
const port = 9000;


const app = express();

app.use(webpackMiddleware(compiler, {
  publicPath: webpackConfig.output.publicPath,
  hot: true,
  noInfo: true,
  quiet: false,
  historyApiFallback: true,
  stats: { colors: true },
  headers: {'Access-Control-Allow-Origin': '*'},
  host: host,
  port: port
}));

app.use(webpackHotMiddleware(compiler, {
  log: console.log
}));

require('../server/app')(app);

app.listen(port, function onAppListening(err) {
  if (err) {
    console.error(err);
  } else {
    console.info('==> Webpack development server listening on port %s', port);
  }
});

