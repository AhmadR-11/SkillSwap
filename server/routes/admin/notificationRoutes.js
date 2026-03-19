const express = require('express');
const router  = express.Router();
const { protectAdmin, protectAny } = require('../../middleware/authMiddleware');
const ctl    = require('../../controllers/admin/notificationController');

// Template management
router.post   ('/admin/notifications/templates', protectAdmin, ctl.createTemplate);
router.get    ('/admin/notifications/templates', protectAdmin, ctl.listTemplates);
router.patch  ('/admin/notifications/templates/:id', protectAdmin, ctl.updateTemplate);
router.delete ('/admin/notifications/templates/:id', protectAdmin, ctl.deleteTemplate);

// Scheduling notifications
router.post   ('/admin/notifications/send', protectAdmin, ctl.scheduleNotification);

// User preferences (accessible to any authenticated user)
router.get    ('/notifications/preferences', protectAny, ctl.getPreferences);
router.patch  ('/notifications/preferences', protectAny, ctl.updatePreferences);

module.exports = router;
