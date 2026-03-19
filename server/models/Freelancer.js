// server/models/Freelancer.js
const { Schema, model } = require('mongoose');

const FreelancerSchema = new Schema({
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true },
  password:     { type: String, required: true },
  skills:       [{ type: String }],
  portfolio:    [{ type: String }],     // URLs
  docs:         [{ type: String }],     // file‐paths
  verified:     { type: Boolean, default: false },
  verificationLevel: {
    type: String,
    enum: ['Basic', 'Verified', 'Premium'],
    default: 'Basic',
  },
}, { timestamps: true });

module.exports = model('Freelancer', FreelancerSchema);
