const express = require('express');
const router  = express.Router();
const path    = require('path');
const multer  = require('multer');
const fs      = require('fs');

const {
  getProfile,
  updateProfile,
  searchFreelancers,
  getFreelancerProjects,
  updateFreelancerProjectStatus
} = require('../../controllers/freelancer/freelancerController');

const {
  protectFreelancer,
  protectClient           // ← ensure import
} = require('../../middleware/authMiddleware');

// Multer setup (absolute path)
const docsPath = path.join(__dirname, '../../uploads/docs');
const storage  = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure directory exists
    fs.mkdirSync(docsPath, { recursive: true });
    cb(null, docsPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  }
});
const upload = multer({ storage });

// Client-facing search (only verified tutors)
router.get(
  '/freelancers',
  protectClient,
  searchFreelancers
);

router.get(
  '/freelancer/projects',
  protectFreelancer,
  getFreelancerProjects     // ← new
);

// Protected freelancer profile
router.get(
  '/freelancer/profile',
  protectFreelancer,
  getProfile
);

router.patch(
  '/freelancer/projects/:id',
  protectFreelancer,
  updateFreelancerProjectStatus
);

router.put(
  '/freelancer/profile',
  protectFreelancer,
  upload.array('docs', 5),
  updateProfile
);

module.exports = router;
