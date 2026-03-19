const crypto   = require('crypto');
const mongoose = require('mongoose');
const Message  = require('../../models/Message');

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET /api/messages/:otherId
exports.getMessages = async (req, res, next) => {
  try {
    const me = req.user.id;
    const other = req.params.otherId;
    if (!isValidId(other)) return res.status(400).json({ message: 'Invalid user ID' });

    // fetch both directions
    const msgs = await Message.find({
      $or: [
        { senderId: me,    receiverId: other },
        { senderId: other, receiverId: me }
      ]
    }).sort('timestamp');

    res.json(msgs);
  } catch (err) { next(err); }
};

// POST /api/messages
exports.sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;
    if (!isValidId(receiverId)) return res.status(400).json({ message: 'Invalid receiver' });
    if (!content) return res.status(400).json({ message: 'Empty message' });

    // build metadata: IP + user-agent + timestamp
    const metadata = {
      ip: req.ip,
      ua: req.headers['user-agent'] || '',
      ts: Date.now()
    };
    const hash = crypto.createHash('sha256')
                       .update(JSON.stringify(metadata))
                       .digest('hex');

    const msg = await Message.create({
      senderId, receiverId, content,
      metadataHash: hash
    });

    // emit to both rooms
    const io = req.app.get('io');
    io.to(`user_${receiverId}`).emit('message', msg);
    io.to(`user_${senderId}`).emit('message', msg);

    res.status(201).json(msg);
  } catch (err) { next(err); }
};

// PATCH /api/messages/:otherId/read
exports.markRead = async (req, res, next) => {
  try {
    const me = req.user.id;
    const other = req.params.otherId;
    if (!isValidId(other)) return res.status(400).json({ message: 'Invalid user ID' });

    // update all incoming unread
    await Message.updateMany(
      { senderId: other, receiverId: me, readStatus: false },
      { $set: { readStatus: true } }
    );

    // notify other
    const io = req.app.get('io');
    io.to(`user_${other}`).emit('readReceipt', { from: me });

    res.json({ message: 'Read' });
  } catch (err) { next(err); }
};
