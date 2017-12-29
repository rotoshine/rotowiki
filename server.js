require('dotenv').config();

const isDev = process.env.NODE_ENV !== 'production';

const { parse } = require('url');
const next = require('next');
const routes = require('./routes');
const app = next({ dev: isDev });
const handler = routes.getRequestHandler(app);
const express = require('express');
const bodyParser = require('body-parser');
const server = express();
const mongoose = require('mongoose');
const { MONGODB_HOST_DEV, MONGODB_HOST_PRODUCTION } = process.env;
const mongodbHost = isDev ? MONGODB_HOST_DEV : MONGODB_HOST_PRODUCTION;

async function start() {
  console.log(`server starting... ${isDev ? 'development' : 'production'} mode.`)
  try {
    // database initialize
    mongoose.Promise = global.Promise;
    const db = await mongoose.connect(mongodbHost, {
      useMongoClient: true
    });

    // load models
    require('./models/Document')(db);
    require('./models/DocumentHistory')(db);
    require('./models/File')(db);
    require('./models/User')(db);

    // api loading
    server.use(bodyParser.json());
    server.use('/api/documents', require('./api/document/routes'));

    // app initilize
    await app.prepare();


    server.get('*', (req, res, next) => {
      // 기본값 넣어주기
      req.wikiUrl = process.env.WIKI_URL;
      next();
    });

    server.use(handler);

    const port = process.env.PORT || 3000;
    server.listen(port);
    console.log(`server start. port : ${port}`);
  } catch (e) {
    console.error(e);
  }
};

start();

