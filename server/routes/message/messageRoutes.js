const express = require('express');
const router  = express.Router();
const {
  getMessages,
  sendMessage,
  markRead
} = require('../../controllers/message/messageController');
const { protectAny } = require('../../middleware/authMiddleware');

router.use(protectAny);

router.get('/:otherId',     getMessages);
router.post('/',            sendMessage);
router.patch('/:otherId/read', markRead);

module.exports = router;
