const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Admin = require('../models/Admin');
const Freelancer = require('../models/Freelancer');
const Client = require('../models/Client');
const { hashPassword } = require('./hash');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const role = req.query.role || 'client'; // Default to client if no role specified
        const email = profile.emails[0].value;
        const name = profile.displayName;
        
        // Check if user exists based on role
        let user;
        
        if (role === 'admin') {
          user = await Admin.findOne({ email });
          if (!user) {
            // Create new admin
            const password = await hashPassword(Math.random().toString(36).slice(-8));
            user = await Admin.create({ 
              name, 
              email, 
              password,
              googleId: profile.id
            });
          } else if (!user.googleId) {
            // Update existing user with Google ID
            user.googleId = profile.id;
            await user.save();
          }
        } else if (role === 'freelancer') {
          user = await Freelancer.findOne({ email });
          if (!user) {
            // Create new freelancer
            const password = await hashPassword(Math.random().toString(36).slice(-8));
            user = await Freelancer.create({ 
              name, 
              email, 
              password,
              googleId: profile.id
            });
          } else if (!user.googleId) {
            // Update existing user with Google ID
            user.googleId = profile.id;
            await user.save();
          }
        } else {
          // Client
          user = await Client.findOne({ email });
          if (!user) {
            // Create new client
            const password = await hashPassword(Math.random().toString(36).slice(-8));
            user = await Client.create({ 
              name, 
              email, 
              password,
              googleId: profile.id,
              verified: true // Auto-verify Google users
            });
          } else if (!user.googleId) {
            // Update existing user with Google ID
            user.googleId = profile.id;
            if (!user.verified) user.verified = true;
            await user.save();
          }
        }
        
        return done(null, { id: user._id, role });
      } catch (err) {
        return done(err);
      }
    }
  )
);

module.exports = passport;