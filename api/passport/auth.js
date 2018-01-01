require('dotenv').config();

const secret = process.env.JWT_SECRET || 'rotowiki';
const mongoose = require('mongoose');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const compose = require('composable-middleware');
const User = mongoose.model('User');
const validateJwt = expressJwt({ secret });

function getToken(req) {
  const { headers } = req;
  if (headers.authorization && headers.authorization.startsWith('Bearer')) {
    return headers.authorization.split(' ')[1];
  }
  return token;
}

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
function isAuthenticated() {
  return compose()
    // Attach user to request
    .use(async (req, res, next) => {
      try {
        const token = getToken(req);

        if (!token) {
          return next(new Error('token not found.'));
        }

        const user = await User.findById(tokenToUser(token)._id);
        if (!user) {
          return res.send(401);
        }

        req.user = user;
        next();
      } catch (err) {
        console.log(err);
        if (err) return next(err);
      }
    });
}

async function tokenToUser(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, async (err, decoded) => {
      if(err) {
        return reject(err);
      }

      const user = await User.findById(decoded._id);

      if (!user) {
        return reject(new Error('user not found.'));
      } else {
        const { _id, name, twitter } = user;

        return resolve({
          _id,
          name,
          profileImageUrl: twitter.profile_image_url_https
        });
      }
    });
  })
}

/**
 * Checks if the user role meets the minimum requirements of the route
 */
function hasRole(roleRequired) {
  if (!roleRequired) throw new Error('Required role needs to be set');

  return compose()
    .use(isAuthenticated())
    .use(function meetsRequirements(req, res, next) {
      if (config.userRoles.indexOf(req.user.role) >= config.userRoles.indexOf(roleRequired)) {
        next();
      }
      else {
        res.send(403);
      }
    });
}

/**
 * Returns a jwt token signed by the app secret
 */
function signToken(id) {
  return jwt.sign({ _id: id }, secret, { expiresIn: '7d' });
}

/**
 * Set token cookie directly for oAuth strategies
 */
function setTokenCookie(req, res) {
  if (!req.user) {
    return res.json(404, { message: 'Something went wrong, please try again.' });
  }
  var token = signToken(req.user._id, req.user.role);
  res.cookie('token', JSON.stringify(token));
  res.redirect('/');
}

exports.getToken = getToken;
exports.isAuthenticated = isAuthenticated;
exports.hasRole = hasRole;
exports.signToken = signToken;
exports.setTokenCookie = setTokenCookie;
exports.tokenToUser = tokenToUser;
