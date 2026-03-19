const { Schema, model } = require('mongoose');

const NotificationTemplateSchema = new Schema({
  name:        { type: String, required: true, unique: true },
  type:        { type: String, enum: ['email','sms'], required: true },
  subject:     { type: String },       // for email
  body:        { type: String, required: true }, 
  createdAt:   { type: Date, default: Date.now }
});

module.exports = model('NotificationTemplate', NotificationTemplateSchema);
