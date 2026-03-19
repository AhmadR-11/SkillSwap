// server/controllers/projectController.js
const Project = require('../../models/Project');

exports.getAllProjects = async (req, res, next) => {
  try {
    // return only id & title for the dropdown
    const projects = await Project.find().select('_id title').lean();
    res.json(projects);
  } catch (err) {
    next(err);
  }
};
