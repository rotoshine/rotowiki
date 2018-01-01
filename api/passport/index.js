require('dotenv').config();

const mongoose = require('mongoose');
const express = require('express');
const passport = require('passport');
const User = mongoose.model('User');
const auth = require('./auth');

const { TWITTER_ID, TWITTER_SECRET, WIKI_URL } = process.env
// Passport Configuration
require('./twitter').setup(User, {
  clientID: process.env.TWITTER_ID,
  clientSecret: process.env.TWITTER_SECRET,
  callbackURL: `${process.env.WIKI_URL}/auth/twitter/callback`
});

const router = express.Router();

router.get('/token', async (req, res) => {
  const isValid = await auth.validToken(req);

  return res.json({
    isValid
  });
});

router.get('/auth/twitter', passport.authenticate('twitter'));

router.get('/auth/twitter/callback', passport.authenticate('twitter', {
  session: false,
  failureRedirect: '/error/login-fail'
}), auth.setTokenCookie);

// token으로 사용자 정보 얻어오는 부분
// get이 맞으려나?
router.get('/users/me', async (req, res) => {
  try {
    const token = auth.getToken(req);

    if (token) {
      const user = await auth.tokenToUser(token);
      return res.json({
        success: true,
        user
      });
    } else {
      return res.json({
        succes: false,
        message: 'invalid token.'
      });
    }

  } catch (e) {
    console.error(e);
    return res.status(403).json({ message: e.message });
  }
});

router.get('/logout', (req, res) => {
  res.clearCookie('token');

  res.redirect('/');
});
module.exports = router;
