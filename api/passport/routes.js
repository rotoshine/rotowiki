require('dotenv').config();

const mongoose = require('mongoose');
const express = require('express');
const passport = require('passport');
const User = mongoose.model('User');

// Passport Configuration
require('./twitter').setup(User, {
  clientID: process.env.TWITTER_ID,
  clientSecret: process.env.TWITTER_SECRET,
  callbackURL: `${process.env.WIKI_URL}/auth/twitter/callback`
});

var router = express.Router();

router.use('/twitter', require('./twitter'));

module.exports = router;
