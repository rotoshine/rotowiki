require('dotenv').config();

const isDev = process.env.NODE_ENV !== 'production';

const { parse } = require('url');
const next = require('next');
const routes = require('./routes');
const app = next({ dev: isDev });
const handler = routes.getRequestHandler(app);
const passport = require('passport');
const express = require('express');
const bodyParser = require('body-parser');
const server = express();
const mongoose = require('mongoose');
const { MONGODB_HOST_DEV, MONGODB_HOST_PRODUCTION, WIKI_URL, JWT_SECRET, PORT } = process.env;
const mongodbHost = isDev ? MONGODB_HOST_DEV : MONGODB_HOST_PRODUCTION;
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const cookieParser = require('cookie-parser');

if (isDev && !MONGODB_HOST_DEV) {
  throw new Error('you must add MONGODB_HOST_DEV to .env');
}

if (!isDev && !MONGODB_HOST_PRODUCTION) {
  throw new Error('you must add MONGODB_HOST_PRODUCTION to .env');
}

if (!WIKI_URL) {
  throw new Error('you must add WIKI_URL to .env');
}

async function start() {
  console.log(`server starting... ${isDev ? 'development' : 'production'} mode.`)
  try {
    // database initialize`
    mongoose.Promise = global.Promise;
    const db = await mongoose.connect(mongodbHost, {
      useMongoClient: true
    });

    // load models
    require('./models/Document')(db);
    require('./models/DocumentHistory')(db);
    require('./models/File')(db);
    require('./models/User')(db);

    server.use(cookieParser());

    // session setting
    server.use(session({
      secret: JWT_SECRET,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
      },
      saveUninitialized: true,
      resave: true,
      store: new MongoDBStore({ uri: mongodbHost, collections: 'wikiSessions'})
    }));


    // auth route loading
    server.use(passport.initialize());
    server.use(require('./api/passport'));

    // api loading
    server.use(bodyParser.json());
    server.use('/api/documents', require('./api/document/routes'));

    // app initilize
    await app.prepare();


    server.get('*', (req, res, next) => {
      // 기본값 넣어주기
      req.wikiUrl = WIKI_URL;

      next();
    });

    server.use(handler);

    const port = PORT || 3000;
    server.listen(port);
    console.log(`server start. port : ${port}`);
    console.log(`wiki url: ${WIKI_URL}`);
  } catch (e) {
    console.error(e);
  }
};

start();

