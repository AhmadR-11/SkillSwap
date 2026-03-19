const { Schema, model } = require('mongoose');

const NotificationSchema = new Schema({
  toUserId:      { type: Schema.Types.ObjectId, required: true },
  role:          { type: String, enum: ['Client','Freelancer','Admin'], required: true },
  template:      { type: Schema.Types.ObjectId, ref: 'NotificationTemplate', required: true },
  channel:       { type: String, enum: ['email','sms'], required: true },
  data:          { type: Schema.Types.Mixed, default: {} },
  status:        { type: String, enum: ['pending','sent','failed'], default: 'pending' },
  scheduledFor:  { type: Date, default: Date.now },
  sentAt:        Date,
  error:         String
}, { timestamps: true });

module.exports = model('Notification', NotificationSchema);
