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

    server.use(handler);

    server.listen(process.env.PORT || 3000);
  } catch (e) {
    console.error(e);
  }
};

start();

