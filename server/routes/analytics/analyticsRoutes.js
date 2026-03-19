const express = require('express');
const router  = express.Router();
const { getClientAnalytics } = require('../../controllers/analytics/analyticsController');
const { protectClient }      = require('../../middleware/authMiddleware');

// GET /api/client/analytics?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD
router.get('/client/analytics', protectClient, getClientAnalytics);

module.exports = router;
