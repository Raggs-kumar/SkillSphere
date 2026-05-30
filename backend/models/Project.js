const mongoose = require('mongoose');
const { PROJECT_STATUS } = require('../constants');

const ProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    budget: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: PROJECT_STATUS,
      default: 'open',
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location: {
      city: { type: String, default: 'Local' },
      distanceKm: { type: Number, default: 1 },
    },
    flaggedReason: { type: String, default: '' },
    acceptedFreelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

ProjectSchema.index({ client: 1, createdAt: -1 });
ProjectSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Project', ProjectSchema);
