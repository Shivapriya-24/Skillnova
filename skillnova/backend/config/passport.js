const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;

passport.use(
  new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: '/api/auth/linkedin/callback',
      scope: ['r_emailaddress', 'r_liteprofile'],
      state: true,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error('No email in LinkedIn profile'));

        let user = await User.findOne({ linkedinId: profile.id });
        if (user) return done(null, user);

        const emailUser = await User.findOne({ email });
        if (emailUser) {
          return done(null, false, {
            type: 'ACCOUNT_EXISTS',
            message: 'User already exists. Please log in.',
          });
        }

        const action = req.session.action || 'login';
        if (action === 'login') {
          return done(null, false, {
            type: 'NO_ACCOUNT',
            message: 'Please sign up first',
          });
        }

        const newUser = await User.create({
          email,
          username: profile.displayName || email.split('@')[0],
          linkedinId: profile.id,
          role: 'both',
        });

        return done(null, newUser);
      } catch (err) {
        return done(err);
      }
    }
  )
);
const GitHubStrategy = require('passport-github2').Strategy;

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: '/api/auth/github/callback',
    scope: ['user:email'],
    passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error('No email in GitHub profile'));

        let user = await User.findOne({ githubId: profile.id });
        if (user) return done(null, user);

        const emailUser = await User.findOne({ email });
        if (emailUser) {
            return done(null, false, {
                type: 'ACCOUNT_EXISTS',
                message: 'User already exists. Please login using another method.'
            });
        }

        const action = req.session.action || 'login';
        if (action === 'login') {
            return done(null, false, {
                type: 'NO_ACCOUNT',
                message: 'Please sign up first'
            });
        }

        const newUser = await User.create({
            email,
            username: profile.username || email.split('@')[0],
            githubId: profile.id,
            role: 'both'
        });

        return done(null, newUser);
    } catch (err) {
        return done(err);
    }
}));


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
      passReqToCallback: true,               
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error('No email in Google profile'));

        let user = await User.findOne({ googleId: profile.id });
        if (user) return done(null, user);

        const emailUser = await User.findOne({ email });
        if (emailUser) {
          return done(null, false, {
            type: 'ACCOUNT_EXISTS',
            message: 'User already exists. Please log in.',
          });
        }

        const action = req.session.action || 'login';
        if (action === 'login') {
          return done(null, false, {
            type: 'NO_ACCOUNT',
            message: 'Please sign up first',
          });
        }

        const newUser = await User.create({
          email,
          username: profile.displayName || email.split('@')[0],
          googleId: profile.id,
          role: 'both',
        });
        return done(null, newUser);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
