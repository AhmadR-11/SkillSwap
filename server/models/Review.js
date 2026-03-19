const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const ReviewSchema = new Schema({
  projectId:    { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  clientId:     { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  freelancerId: { type: Schema.Types.ObjectId, ref: 'Freelancer', required: true },
  rating:       { type: Number, min: 1, max: 5, required: true },
  comment:      { type: String, default: '' },
  timestamp:    { type: Date, default: Date.now },
  response:     { type: String, default: '' },
  responseAt:   { type: Date }
}, { timestamps: true });

module.exports = model('Review', ReviewSchema);
