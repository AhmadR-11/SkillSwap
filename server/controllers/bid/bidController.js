// server/controllers/bid/bidController.js
const mongoose = require('mongoose');
const Bid      = require('../../models/Bid');
const Project  = require('../../models/Project');

/**
 * Helper: check for a valid MongoDB ObjectId
 */
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

exports.createBid = async (req, res, next) => {
  try {
    const { projectId, amount, message } = req.body;
    if (!isValidObjectId(projectId)) {
      return res.status(400).json({ message: 'Invalid projectId' });
    }

    // 1) Create the bid
    let bid = await Bid.create({
      projectId,
      freelancerId: req.user.id,
      amount,
      message
    });

    // 2) Populate the freelancer info (no execPopulate)
    bid = await bid.populate('freelancerId', 'name portfolio');

    // 3) Notify any clients in the project room
    const io = req.app.get('io');
    io.to(`project_${projectId}`).emit('bidCreated', bid);

    // 4) Return the populated bid
    res.status(201).json(bid);
  } catch (err) {
    next(err);
  }
};

exports.updateBid = async (req, res, next) => {
  try {
    const bidId = req.params.id;
    if (!isValidObjectId(bidId)) {
      return res.status(400).json({ message: 'Invalid bid ID' });
    }
    const bid = await Bid.findById(bidId);
    if (!bid) return res.status(404).json({ message: 'Bid not found' });
    if (bid.freelancerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (bid.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot edit after decision' });
    }

    const { amount, message } = req.body;
    if (amount   !== undefined) bid.amount  = amount;
    if (message  !== undefined) bid.message = message;
    await bid.save();
    res.json(bid);
  } catch (err) {
    next(err);
  }
};

exports.getFreelancerBids = async (req, res, next) => {
  try {
    const bids = await Bid.find({ freelancerId: req.user.id })
      .sort('-createdAt')
      .populate({
        path: 'projectId',
        select: 'title clientId', // Include title and clientId
        populate: {
          path: 'clientId',
          select: 'name _id' // Ensure _id is included
        }
      });

    // Filter out any bids with null projectId or clientId
    const validBids = bids.filter(bid =>
      bid.projectId &&
      typeof bid.projectId === 'object' &&
      bid.projectId.clientId
    );

    res.json(validBids);
  } catch (err) {
    next(err);
  }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const bids = await Bid.find({ freelancerId: req.user.id });
    const count   = bids.length;
    const sum     = bids.reduce((acc, b) => acc + b.amount, 0);
    const average = count ? sum / count : 0;
    const status  = bids.reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {});
    res.json({
      count,
      average,
      status: {
        pending:  status.pending  || 0,
        accepted: status.accepted || 0,
        rejected: status.rejected || 0,
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getBidsForProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    if (!isValidObjectId(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }
    const project = await Project.findById(projectId);
    if (!project || project.clientId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Project not found' });
    }
    const bids = await Bid.find({ projectId })
      .populate('freelancerId', 'name portfolio');
    res.json(bids);
  } catch (err) {
    next(err);
  }
};

exports.clientDecision = async (req, res, next) => {
  try {
    const bidId = req.params.id;
    const { decision } = req.body;

    // 1) Validate bidId
    if (!mongoose.Types.ObjectId.isValid(bidId)) {
      return res.status(400).json({ message: 'Invalid bid ID' });
    }

    // 2) Validate decision
    if (!['accepted', 'rejected'].includes(decision)) {
      return res.status(400).json({ message: 'Invalid decision' });
    }

    // 3) Find bid + freelancer info
    const bid = await Bid.findById(bidId).populate('freelancerId', 'name portfolio');
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    // 4) Ensure the current user owns the project
    const project = await Project.findById(bid.projectId);
    if (!project || project.clientId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // 5) Update and save
    bid.status = decision;
    await bid.save();

    // 6) Re-populate (in case anything changed) and emit
    const updatedBid = await Bid.findById(bidId).populate('freelancerId', 'name portfolio');
    const io = req.app.get('io');
    io.to(`project_${updatedBid.projectId}`).emit('bidUpdated', updatedBid);

    // 7) Respond
    return res.json(updatedBid);
  } catch (err) {
    next(err);
  }
};

exports.counterOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, message } = req.body;
    if (!isValid(id)) return res.status(400).json({ message: 'Invalid bid ID' });

    const bid = await Bid.findById(id).populate('freelancerId', 'name portfolio');
    if (!bid) return res.status(404).json({ message: 'Bid not found' });

    const project = await Project.findById(bid.projectId);
    if (!project || project.clientId.toString() !== req.user.id)
      return res.status(403).json({ message: 'Forbidden' });

    bid.counterOffer = { amount, message, timestamp: new Date() };
    await bid.save();

    const io = req.app.get('io');
    io.to(`project_${bid.projectId}`).emit('bidCountered', bid);

    res.json(bid);
  } catch (err) {
    next(err);
  }
};

exports.deleteBid = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid bid ID' });
    }
    const bid = await Bid.findById(id);
    if (!bid) return res.status(404).json({ message: 'Bid not found' });
    if (bid.freelancerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await bid.deleteOne();
    res.json({ message: 'Bid deleted' });
  } catch (err) {
    next(err);
  }
};
