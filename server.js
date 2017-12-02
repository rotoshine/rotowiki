require('dotenv').config();
const next = require('next');
const routes = require('./routes');
const app = next({ dev: process.env.NODE_ENV !== 'production ' });
const handle = routes.getRequestHandler();
const express = require('express');
const bodyParser = require('body-parser');
const server = express();
const mongoose = require('mongoose');

async function start() {
  try {
    await app.prepare();
    
    mongoose.Promise = global.Promise;
    const db = await mongoose.connect(process.env.MONGODB_HOST, {
      useMongoClient: true
    });

    // load models
    require('./models/Document')(db);
    require('./models/DocumentHistory')(db);
    require('./models/File')(db);
    require('./models/User')(db);           
    
    server.use(bodyParser.json());

    // api loading    
    server.use('/api/documents', require('./api/document/routes'));

    

    server.use(handler);

    server.listen(process.env.PORT || 3000);
  } catch (e) {
    console.error(e);
  }
};

start();

