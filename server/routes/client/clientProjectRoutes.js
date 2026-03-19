const express = require('express');
const router  = express.Router();
const {
  createProject,
  getClientProjects,
  getProject,
  updateProject,
  deleteProject
} = require('../../controllers/client/clientProjectController');
const { protectClient } = require('../../middleware/authMiddleware');

router.post(
  '/client/projects',
  protectClient,
  createProject
);

router.get(
  '/client/projects',
  protectClient,
  getClientProjects
);

router.get(
  '/client/projects/:id',
  protectClient,
  getProject
);

router.put(
  '/client/projects/:id',
  protectClient,
  updateProject
);

router.delete(
  '/client/projects/:id',
  protectClient,
  deleteProject
);

module.exports = router;
