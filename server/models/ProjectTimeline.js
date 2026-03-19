const { Schema, model } = require('mongoose');

const ProjectTimelineSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  freelancerId: { type: Schema.Types.ObjectId, ref: 'Freelancer', required: true },
  progress: { type: Number, default: 0 }, // percentage
  timeTracked: { type: Number, default: 0 }, // in hours
  milestones: [
    {
      title: String,
      status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
      dueDate: Date
    }
  ],
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = model('ProjectTimeline', ProjectTimelineSchema);
