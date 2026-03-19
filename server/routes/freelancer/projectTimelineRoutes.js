const express = require('express');
const router = express.Router();
const { protectFreelancer } = require('../../middleware/authMiddleware');
const {
  getTimeline,
  updateTimeline
} = require('../../controllers/time/projectTimelineController');

router.get('/:projectId', protectFreelancer, getTimeline);
router.put('/:projectId', protectFreelancer, updateTimeline);

module.exports = router;
