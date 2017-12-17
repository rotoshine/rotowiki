require('dotenv').config();

const { parse } = require('url');
const next = require('next');
const app = next({ dev: process.env.NODE_ENV !== 'production ' });
const handle = app.getRequestHandler();
const express = require('express');
const bodyParser = require('body-parser');
const server = express();
const mongoose = require('mongoose');         

async function start() {
  try {
    // database initialize
    mongoose.Promise = global.Promise;
    const db = await mongoose.connect(process.env.MONGODB_HOST, {
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

    server.get('/document/:title', (req, res) => {      
      const { title } = req.params;     
      const params = { title };
      return app.render(req, res, `/document`, params);
    });

    server.get('*', (req, res) => {    
      return handle(req, res);
    });

    server.listen(process.env.PORT || 3000);
  } catch (e) {
    console.error(e);
  }
};

start();

