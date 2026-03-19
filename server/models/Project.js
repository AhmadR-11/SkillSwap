const { Schema, model } = require('mongoose');

const ProjectSchema = new Schema({
  title: String,
  description: String,
  requirements: String,      // if you added this field
  deadline: Date,
  clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
  status: {                  // <— enforce a default
    type: String,
    enum: ['open','in-progress','completed','cancelled'],
    default: 'open'
  },
  // ... other fields ...
}, { timestamps: true });

module.exports = model('Project', ProjectSchema);