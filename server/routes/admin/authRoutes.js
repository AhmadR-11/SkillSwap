// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const {signupAdmin, loginAdmin} = require('../../controllers/admin/authController');

const {signupClient, verifyClient, loginClient} = require('../../controllers/admin/authController');

const {signupFreelancer, loginFreelancer} = require('../../controllers/admin/authController');

const {googleAuthCallback} = require('../../controllers/admin/authController');

// POST /api/auth/admin/signup
router.post('/admin/signup', signupAdmin);

// POST /api/auth/admin/login
router.post('/admin/login', loginAdmin);

// freelancer
router.post('/freelancer/signup', signupFreelancer);
router.post('/freelancer/login',  loginFreelancer);

// Client
router.post('/client/signup', signupClient);
router.post('/client/verify', verifyClient);
router.post('/client/login',  loginClient);

router.get('/google', 
  (req, res, next) => {
    const role = req.query.role || 'client';
    passport.authenticate('google', { 
      scope: ['profile', 'email'],
      state: role
    })(req, res, next);
  }
);

router.get('/google/callback', 
  (req, res, next) => {
    // Extract role from state parameter
    const role = req.query.state || 'client';
    req.query.role = role;
    
    passport.authenticate('google', { 
      failureRedirect: `${process.env.CLIENT_URL}/login?error=Google authentication failed`,
      session: false
    })(req, res, next);
  },
  googleAuthCallback
);

module.exports = router;
