// server/controllers/admin/analyticsController.js
const mongoose   = require('mongoose');
const Client     = require('../../models/Client');
const Freelancer = require('../../models/Freelancer');
const Project    = require('../../models/Project');
const Bid        = require('../../models/Bid');

exports.getPlatformAnalytics = async (req, res, next) => {
  try {
    // 1 year ago
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // 1) User growth: count clients by month
    const userGrowth = await Client.aggregate([
      { $match: { createdAt: { $gte: oneYearAgo } } },
      { $group: {
          _id: { $substr: ['$createdAt', 0, 7] }, // "YYYY-MM"
          count: { $sum: 1 }
      }},
      { $sort: { '_id': 1 } }
    ]);

    // Freelancer growth by month
    const freelancerGrowth = await Freelancer.aggregate([
      { $match: { createdAt: { $gte: oneYearAgo } } },
      { $group: {
          _id: { $substr: ['$createdAt', 0, 7] },
          count: { $sum: 1 }
      }},
      { $sort: { '_id': 1 } }
    ]);

    // 2) Popular skills: top 10
    const popularSkills = await Freelancer.aggregate([
      { $unwind: '$skills' },
      { $group: { _id: '$skills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // 3) Revenue: sum of accepted bid amounts per month
    const revenue = await Bid.aggregate([
      { $match: {
          status: 'accepted',
          createdAt: { $gte: oneYearAgo }
      }},
      { $group: {
          _id: { $substr: ['$createdAt', 0, 7] },
          revenue: { $sum: '$amount' }
      }},
      { $sort: { '_id': 1 } }
    ]);

    // 4) Transactions: total bids vs accepted per month
    const transactions = await Bid.aggregate([
      { $match: { createdAt: { $gte: oneYearAgo } } },
      { $group: {
          _id: { $substr: ['$createdAt', 0, 7] },
          totalBids: { $sum: 1 },
          accepted: {
            $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
          }
      }},
      { $sort: { '_id': 1 } }
    ]);

    return res.json({
      userGrowth,
      freelancerGrowth,
      popularSkills,
      revenue,
      transactions
    });
  } catch (err) {
    console.error('Platform Analytics Error:', err);
    next(err);
  }
};
