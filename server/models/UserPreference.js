const { Schema, model } = require('mongoose');

const UserPreferenceSchema = new Schema({
  userId:      { type: Schema.Types.ObjectId, refPath: 'role', required: true },
  role:        { type: String, enum: ['Client','Freelancer','Admin'], required: true },
  email:       { type: Boolean, default: true },
  sms:         { type: Boolean, default: false },
  updatedAt:   { type: Date, default: Date.now }
});

UserPreferenceSchema.index({ userId:1, role:1 }, { unique: true });

module.exports = model('UserPreference', UserPreferenceSchema);
