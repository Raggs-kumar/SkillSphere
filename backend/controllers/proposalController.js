const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/sendResponse');
const proposalService = require('../services/proposalService');

const submitProposal = asyncHandler(async (req, res) => {
  const result = await proposalService.submitProposal(req.user._id, req.body);
  sendSuccess(res, result, 201);
});

const getMyProposals = asyncHandler(async (req, res) => {
  const proposals = await proposalService.getFreelancerProposals(req.user._id);
  sendSuccess(res, proposals);
});

const toggleSaved = asyncHandler(async (req, res) => {
  const result = await proposalService.toggleSavedProject(req.user._id, req.params.projectId);
  sendSuccess(res, result);
});

const getSaved = asyncHandler(async (req, res) => {
  const saved = await proposalService.getSavedProjects(req.user._id);
  sendSuccess(res, saved);
});

const getStats = asyncHandler(async (req, res) => {
  const stats = await proposalService.getFreelancerStats(req.user._id);
  sendSuccess(res, stats);
});

const acceptProposal = asyncHandler(async (req, res) => {
  const proposal = await proposalService.acceptProposal(req.user._id, req.params.id);
  sendSuccess(res, proposal);
});

module.exports = {
  submitProposal,
  getMyProposals,
  toggleSaved,
  getSaved,
  getStats,
  acceptProposal,
};
