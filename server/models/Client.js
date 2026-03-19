const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const ClientSchema = new Schema({
  name:               { type: String, required: true },
  email:              { type: String, required: true, unique: true },
  phone:              { type: String, required: true },
  password:           { type: String, required: true },
  verified:           { type: Boolean, default: false },
  verificationCode:   { type: String },
  verificationExpires:{ type: Date },
}, { timestamps: true });

module.exports = model('Client', ClientSchema);
