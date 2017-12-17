const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const mongoose = require('mongoose');
const User = mongoose.model('User');

exports.setup = function (User, config) {  
  passport.use(new TwitterStrategy({
    consumerKey: config.clientID,
    consumerSecret: config.clientSecret,
    callbackURL: config.callbackURL
  },
  async function(token, tokenSecret, profile, done) {
    try {
      const user = await User.findOne({ 'twitter.id_str': profile.id });

      if (!user) {
        const newUser = new User({
          name: profile.displayName,
          username: profile.username,
          role: 'user',
          provider: 'twitter',
          twitter: profile._json
        });

        await newUser.save();

        return done(null, newUser);
      } else {
        user.name = profile.displayName;
        user.twitter = profile._json;
        
        await user.save();

        return done(null, user);
      }

    } catch (e) {
      return done(null);
    }
  ));
};
