const express = require('express');
const router  = express.Router();
const {
  createReview,
  getFreelancerReviews,
  respondReview
} = require('../../controllers/review/reviewController');
const { protectClient, protectFreelancer } = require('../../middleware/authMiddleware');

// Client leaves review
router.post(
  '/reviews',
  protectClient,
  createReview
);

// Public fetch of freelancer’s reviews
router.get(
  '/freelancer/:freelancerId/reviews',
  getFreelancerReviews
);

// Freelancer responds
router.patch(
  '/reviews/:reviewId/response',
  protectFreelancer,
  respondReview
);

module.exports = router;
