// server/routes/admin/adminRoutes.js
const express = require('express');
const router = express.Router();
const { getAllFreelancers, verifyFreelancer } = require('../../controllers/admin/adminController');

// GET  /api/admin/freelancers
router.get('/freelancers', getAllFreelancers);

// PATCH /api/admin/freelancers/:id/verify
router.patch('/freelancers/:id/verify', verifyFreelancer);

module.exports = router;
