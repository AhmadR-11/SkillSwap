// server/controllers/analyticsController.js
const mongoose = require('mongoose');
const Project  = require('../../models/Project');
const Bid      = require('../../models/Bid');

exports.getClientAnalytics = async (req, res, next) => {
  try {
    // Use the string ID directly—Mongoose will cast it to ObjectId
    const clientId = req.user.id;
    const { date_from, date_to } = req.query;

    // Base match: only this client’s projects
    const matchProj = { clientId };

    // Only filter by createdAt if both from+to are provided
    if (date_from && date_to) {
      matchProj.createdAt = {
        $gte: new Date(date_from),
        $lte: new Date(date_to)
      };
    }

    // 1) Project counts by status
    const statuses = await Project.aggregate([
      { $match: matchProj },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // 2) Bid totals & averages on those projects
    const projIds = await Project.find(matchProj).distinct('_id');
    const bidsAgg = await Bid.aggregate([
      { $match: { projectId: { $in: projIds } } },
      {
        $group: {
          _id: null,
          totalBids: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      }
    ]);
    const bids = bidsAgg[0] || { totalBids: 0, avgAmount: 0 };

    // 3) Freelancer performance: accepted bids grouped by freelancer
    const performance = await Bid.aggregate([
      { $match: { projectId: { $in: projIds }, status: 'accepted' } },
      {
        $group: {
          _id: '$freelancerId',
          acceptedCount: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      },
      {
        $lookup: {
          from: 'freelancers',
          localField: '_id',
          foreignField: '_id',
          as: 'freelancer'
        }
      },
      { $unwind: '$freelancer' },
      {
        $project: {
          freelancerId: '$_id',
          name: '$freelancer.name',
          acceptedCount: 1,
          avgAmount: 1
        }
      }
    ]);

    return res.json({ statuses, bids, performance });
  } catch (err) {
    console.error('Analytics error:', err);
    return res.status(500).json({ message: 'Server error retrieving analytics' });
  }
};
