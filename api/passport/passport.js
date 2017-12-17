consst passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

exports.setup = function (User, config) {
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password' // this is the virtual field on the model
  },
    async function (email, password, done) {
      try {
        const user = await User.findOne({ email: email.toLocaleLowerCase() });

        if (!user) {
          return done(null, false, { message: 'This email is not registered.' });
        }
        if (!user.authenticate(password)) {
          return done(null, false, { message: 'This password is not correct.' });
        }
        return done(null, user);

      } catch (e) {
        return done(e);
      }
    }
  ));
};