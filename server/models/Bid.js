// server/models/Bid.js
const { Schema, model } = require('mongoose');

const CounterSchema = new Schema({
  amount:    Number,
  message:   String,
  timestamp: Date
}, { _id: false });

const BidSchema = new Schema({
  projectId:     { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  freelancerId:  { type: Schema.Types.ObjectId, ref: 'Freelancer', required: true },
  amount:        { type: Number, required: true },
  message:       { type: String, default: '' },
  status:        { type: String, enum: ['pending','accepted','rejected'], default: 'pending' },
  counterOffer:  CounterSchema
}, { timestamps: true });

module.exports = model('Bid', BidSchema);
