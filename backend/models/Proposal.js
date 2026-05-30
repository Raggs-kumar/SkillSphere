const mongoose = require('mongoose');
const { PROPOSAL_STATUS } = require('../constants');

const ProposalSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: { type: String, default: '', trim: true },
    bidAmount: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: PROPOSAL_STATUS,
      default: 'pending',
    },
  },
  { timestamps: true }
);

ProposalSchema.index({ project: 1, freelancer: 1 }, { unique: true });
ProposalSchema.index({ freelancer: 1, createdAt: -1 });

module.exports = mongoose.model('Proposal', ProposalSchema);
