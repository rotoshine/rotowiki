require('dotenv').config();
const next = require('next');
const routes = require('./routes');
const nextApp = next({ dev: process.env.NODE_ENV !== 'production ' });
const handler = routes.getRequestHandler(nextApp);
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');

async function start() {
  try {
    mongoose.Promise = global.Promise;
    const db = await mongoose.connect(process.env.MONGODB_HOST, {
      useMongoClient: true
    });

    // load models
    require('./models/Document')(db);
    require('./models/DocumentHistory')(db);
    require('./models/File')(db);
    require('./models/User')(db);

    await nextApp.prepare();
    app.use((req, res, next) => {
      req.db = db;
      next();
    });
    app.use(handler);
    app.use(bodyParser.json());

    app.listen(process.env.PORT || 3000);
  } catch (e) {
    console.error(e);
  }
};

start();

