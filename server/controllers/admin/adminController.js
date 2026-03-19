// server/controllers/admin/adminController.js
const Freelancer = require('../../models/Freelancer');

exports.getAllFreelancers = async (req, res, next) => {
  try {
    const list = await Freelancer.find();
    res.json(list);
  } catch (err) {
    next(err);
  }
};

exports.verifyFreelancer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { approved, level } = req.body; 
    const freelancer = await Freelancer.findById(id);
    if (!freelancer) return res.status(404).json({ message: 'Not found' });

    freelancer.verified = !!approved;
    if (approved && level) freelancer.verificationLevel = level;
    await freelancer.save();

    res.json(freelancer);
  } catch (err) {
    next(err);
  }
};
