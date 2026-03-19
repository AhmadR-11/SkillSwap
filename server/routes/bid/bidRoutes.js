// server/routes/bidRoutes.js
const express = require('express');
const router  = express.Router();
const {
  createBid,
  updateBid,
  getFreelancerBids,
  getAnalytics,
  getBidsForProject,
  clientDecision,
  counterOffer,
  deleteBid
} = require('../../controllers/bid/bidController');
const { protectFreelancer, protectClient } = require('../../middleware/authMiddleware');

// Freelancer
router.post('/freelancer/bids', protectFreelancer, createBid);
router.put ('/freelancer/bids/:id', protectFreelancer, updateBid);
router.get ('/freelancer/bids', protectFreelancer, getFreelancerBids);
router.get ('/freelancer/bids/analytics', protectFreelancer, getAnalytics);

// Client
router.get   ('/client/projects/:projectId/bids', protectClient, getBidsForProject);
router.patch ('/client/bids/:id/decision',        protectClient, clientDecision);
router.patch ('/client/bids/:id/counter',         protectClient, counterOffer);
router.delete('/freelancer/bids/:id', protectFreelancer, deleteBid);

module.exports = router;
