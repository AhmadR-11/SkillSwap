// server/controllers/freelancerController.js
const mongoose = require('mongoose');
const Freelancer = require('../../models/Freelancer');
const Bid     = require('../../models/Bid');
const Project = require('../../models/Project');

exports.getFreelancerProjects = async (req, res, next) => {
  try {
    const freelancerId = req.user.id;

    // Find all bids by this freelancer (any status)
    const bids = await Bid.find({ freelancerId })
      .populate({
        path: 'projectId',
        select: 'title description deadline status requirements'
      });

    // Deduplicate projects
    const map = {};
    bids.forEach(b => {
      const p = b.projectId;
      if (p && !map[p._id]) map[p._id] = p;
    });

    const projects = Object.values(map);
    res.json(projects);
  } catch (err) {
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const freelancer = await Freelancer.findById(req.user.id);
    if (!freelancer) return res.status(404).json({ message: 'Not found' });
    res.json(freelancer);
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, skills, portfolio } = req.body;
    // 1) Load the document
    const freelancer = await Freelancer.findById(req.user.id);
    if (!freelancer) return res.status(404).json({ message: 'Not found' });

    // 2) Apply text updates
    if (name)      freelancer.name = name;
    if (skills)    freelancer.skills = skills
                        .split(',')
                        .map(s => s.trim())
                        .filter(Boolean);
    if (portfolio) freelancer.portfolio = portfolio
                        .split(',')
                        .map(s => s.trim())
                        .filter(Boolean);

    // 3) Append any uploaded docs
    if (req.files && req.files.length) {
      const paths = req.files.map(f => `/uploads/docs/${f.filename}`);
      freelancer.docs.push(...paths);
    }

    // 4) Save & return
    await freelancer.save();
    res.json(freelancer);
  } catch (err) {
    next(err);
  }
};

exports.searchFreelancers = async (req, res, next) => {
  try {
    const { name, skills, level } = req.query;
    const filter = { verified: true };

    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }
    if (level) {
      filter.verificationLevel = level;
    }
    if (skills) {
      const arr = skills
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      filter.skills = { $in: arr };
    }

    const list = await Freelancer.find(filter);
    res.json(list);
  } catch (err) {
    next(err);
  }
};

exports.updateFreelancerProjectStatus = async (req, res, next) => {
  try {
    const projId = req.params.id;
    const { status } = req.body;
    // validate ID
    if (!mongoose.Types.ObjectId.isValid(projId)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }
    // validate status
    const allowed = ['open','in-progress','completed','cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    // ensure this freelancer has a bid on that project
    const hasBid = await Bid.exists({
      projectId: projId,
      freelancerId: req.user.id
    });
    if (!hasBid) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    // update project
    const project = await Project.findById(projId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    project.status = status;
    await project.save();
    res.json(project);
  } catch (err) {
    next(err);
  }
};