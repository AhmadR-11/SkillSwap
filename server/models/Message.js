const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const MessageSchema = new Schema({
  senderId:    { type: Schema.Types.ObjectId, required: true },
  receiverId:  { type: Schema.Types.ObjectId, required: true },
  content:     { type: String, required: true },
  timestamp:   { type: Date, default: Date.now },
  readStatus:  { type: Boolean, default: false },
  metadataHash:{ type: String }  // hashed metadata
}, { timestamps: true });

module.exports = model('Message', MessageSchema);
