const mongoose = require('mongoose');

const SavedProjectSchema = new mongoose.Schema(
  {
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
  },
  { timestamps: true }
);

SavedProjectSchema.index({ freelancer: 1, project: 1 }, { unique: true });

module.exports = mongoose.model('SavedProject', SavedProjectSchema);
