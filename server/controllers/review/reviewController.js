// server/controllers/review/reviewController.js
const mongoose = require('mongoose');
const Review   = require('../../models/Review');
const Project  = require('../../models/Project');
const Bid      = require('../../models/Bid');

// Helper to validate ObjectId
const isValidId = id => mongoose.Types.ObjectId.isValid(id);

// Client: leave a review after project is completed
exports.createReview = async (req, res, next) => {
  try {
    const { projectId, rating, comment } = req.body;
    const clientId = req.user.id;

    // 1) Validate projectId
    if (!isValidId(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    // 2) Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be 1–5' });
    }

    // 3) Ensure project belongs to this client
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (project.clientId.toString() !== clientId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // 4) Only allow reviews on completed projects
    if (project.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed projects' });
    }

    // 5) Ensure one review per project per client
    const exists = await Review.findOne({ projectId, clientId });
    if (exists) {
      return res.status(400).json({ message: 'Review already submitted' });
    }

    // 6) Find the accepted bid to get the freelancerId
    const bid = await Bid.findOne({ projectId, status: 'accepted' });
    if (!bid) {
      return res.status(400).json({ message: 'No accepted bid to identify freelancer' });
    }

    // 7) Create the review
    const review = await Review.create({
      projectId,
      clientId,
      freelancerId: bid.freelancerId,
      rating,
      comment
    });

    return res.status(201).json(review);
  } catch (err) {
    next(err);
  }
};

// Public: get all reviews for a freelancer
exports.getFreelancerReviews = async (req, res, next) => {
  try {
    const { freelancerId } = req.params;
    if (!isValidId(freelancerId)) {
      return res.status(400).json({ message: 'Invalid freelancer ID' });
    }
    const reviews = await Review.find({ freelancerId })
      .sort('-timestamp')
      .populate('clientId', 'name');
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};

// Freelancer: respond to a review
exports.respondReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { response } = req.body;
    if (!isValidId(reviewId)) {
      return res.status(400).json({ message: 'Invalid review ID' });
    }
    const rev = await Review.findById(reviewId);
    if (!rev) {
      return res.status(404).json({ message: 'Review not found' });
    }
    if (rev.freelancerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    rev.response   = response;
    rev.responseAt = new Date();
    await rev.save();
    res.json(rev);
  } catch (err) {
    next(err);
  }
};
