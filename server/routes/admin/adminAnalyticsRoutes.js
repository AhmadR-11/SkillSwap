const express = require('express');
const router  = express.Router();
const { protectAdmin }           = require('../../middleware/authMiddleware');
const { getPlatformAnalytics }   = require('../../controllers/admin/analyticsController');

// GET /api/admin/analytics
router.get(
  '/admin/analytics',
  protectAdmin,
  getPlatformAnalytics
);

module.exports = router;
