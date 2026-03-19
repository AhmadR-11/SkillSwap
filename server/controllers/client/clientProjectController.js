const mongoose = require('mongoose');
const Project  = require('../../models/Project');
const Review  = require('../../models/Review');

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

exports.createProject = async (req, res, next) => {
  try {
    const { title, description, requirements, deadline } = req.body;
    if (!title || !description || !requirements || !deadline) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const proj = await Project.create({
      title,
      description,
      requirements,
      deadline: new Date(deadline),
      clientId: req.user.id
    });
    res.status(201).json(proj);
  } catch (err) {
    next(err);
  }
};

exports.getClientProjects = async (req, res, next) => {
  try {
    const clientId = req.user.id;
    // load all projects belonging to this client
    const projects = await Project.find({ clientId }).lean();

    // for each, check if a review exists
    const withReviewed = await Promise.all(
      projects.map(async proj => {
        const revExists = await Review.exists({
          projectId: proj._id,
          clientId
        });
        return {
          ...proj,
          reviewed: Boolean(revExists)
        };
      })
    );

    res.json(withReviewed);
  } catch (err) {
    next(err);
  }
};

exports.getProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }
    const proj = await Project.findById(id);
    if (!proj || proj.clientId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(proj);
  } catch (err) {
    next(err);
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }
    const proj = await Project.findById(id);
    if (!proj || proj.clientId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Project not found' });
    }
    const { title, description, requirements, deadline, status } = req.body;
    if (title)        proj.title        = title;
    if (description)  proj.description  = description;
    if (requirements) proj.requirements = requirements;
    if (deadline)     proj.deadline     = new Date(deadline);
    if (status)       proj.status       = status;
    await proj.save();
    res.json(proj);
  } catch (err) {
    next(err);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    // Find the project and verify ownership
    const proj = await Project.findById(id);
    if (!proj || proj.clientId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // First, delete all bids associated with this project
    const Bid = require('../../models/Bid');
    await Bid.deleteMany({ projectId: id });

    // Then delete the project itself
    await proj.deleteOne();

    // Notify clients via socket.io that the project has been deleted
    const io = req.app.get('io');
    io.to(`project_${id}`).emit('projectDeleted', { projectId: id });

    res.json({ message: 'Project and all associated bids deleted successfully' });
  } catch (err) {
    console.error('Error deleting project:', err);
    next(err);
  }
};
