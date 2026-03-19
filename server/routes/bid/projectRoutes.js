// server/routes/projectRoutes.js
const express = require('express');
const router  = express.Router();
const { protectFreelancer } = require('../../middleware/authMiddleware');
const { getAllProjects }    = require('../../controllers/bid/projectController');

// Freelancers must be logged in to see projects
router.get('/projects', protectFreelancer, getAllProjects);

module.exports = router;
