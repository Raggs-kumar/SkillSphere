const Proposal = require('../models/Proposal');
const Project = require('../models/Project');
const SavedProject = require('../models/SavedProject');
const ApiError = require('../utils/ApiError');
const { createNotification } = require('./notificationService');
const { formatProject } = require('./projectService');

const submitProposal = async (freelancerId, body) => {
  const { projectId, message, bidAmount } = body;

  if (!projectId || !bidAmount) {
    throw new ApiError(400, 'Project and bid amount are required');
  }

  const project = await Project.findById(projectId).populate('client', 'name');
  if (!project) throw new ApiError(404, 'Project not found');
  if (project.status !== 'open') {
    throw new ApiError(400, 'This project is not accepting proposals');
  }
  if (project.client._id.toString() === freelancerId.toString()) {
    throw new ApiError(400, 'You cannot propose on your own project');
  }

  const existing = await Proposal.findOne({ project: projectId, freelancer: freelancerId });
  if (existing) throw new ApiError(400, 'You have already submitted a proposal');

  const proposal = await Proposal.create({
    project: projectId,
    freelancer: freelancerId,
    message: message?.trim() || '',
    bidAmount: Number(bidAmount),
    status: 'pending',
  });

  await createNotification(
    project.client._id,
    `New proposal received on "${project.title}"`,
    'proposal',
    project._id
  );

  return {
    proposal,
    project: formatProject(project.toObject(), { clientName: project.client?.name, applied: true }),
  };
};

const getFreelancerProposals = async (freelancerId) => {
  const proposals = await Proposal.find({ freelancer: freelancerId })
    .sort({ createdAt: -1 })
    .populate({ path: 'project', populate: { path: 'client', select: 'name' } })
    .lean();

  return proposals.map((p) => ({
    _id: p._id,
    id: p._id,
    title: p.project?.title,
    client: p.project?.client?.name || 'Client',
    budget: p.bidAmount,
    status: p.status,
    distance: `${p.project?.location?.distanceKm ?? 1} km`,
    projectId: p.project?._id,
  }));
};

const toggleSavedProject = async (freelancerId, projectId) => {
  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, 'Project not found');

  const existing = await SavedProject.findOne({ freelancer: freelancerId, project: projectId });
  if (existing) {
    await existing.deleteOne();
    return { saved: false, projectId };
  }

  await SavedProject.create({ freelancer: freelancerId, project: projectId });
  return { saved: true, projectId };
};

const getSavedProjects = async (freelancerId) => {
  const saved = await SavedProject.find({ freelancer: freelancerId })
    .populate({ path: 'project', populate: { path: 'client', select: 'name' } })
    .lean();

  return saved
    .filter((s) => s.project)
    .map((s) => ({
      id: s.project._id,
      _id: s.project._id,
      title: s.project.title,
      client: s.project.client?.name,
      budget: s.project.budget,
      distance: `${s.project.location?.distanceKm ?? 1} km`,
      desc: s.project.description,
    }));
};

const getFreelancerStats = async (freelancerId) => {
  const [proposals, accepted, saved] = await Promise.all([
    Proposal.countDocuments({ freelancer: freelancerId }),
    Proposal.countDocuments({ freelancer: freelancerId, status: 'accepted' }),
    SavedProject.countDocuments({ freelancer: freelancerId }),
  ]);

  const earnings = await Proposal.aggregate([
    { $match: { freelancer: freelancerId, status: 'accepted' } },
    { $group: { _id: null, total: { $sum: '$bidAmount' } } },
  ]);

  return {
    totalEarnings: earnings[0]?.total || 0,
    activeContracts: accepted,
    submittedProposals: proposals,
    savedProjects: saved,
  };
};

const acceptProposal = async (clientId, proposalId) => {
  const proposal = await Proposal.findById(proposalId).populate('project');
  if (!proposal) throw new ApiError(404, 'Proposal not found');

  const project = await Project.findById(proposal.project._id).populate('client');
  if (project.client._id.toString() !== clientId.toString()) {
    throw new ApiError(403, 'Not authorized to accept this proposal');
  }

  proposal.status = 'accepted';
  await proposal.save();

  project.status = 'active';
  project.acceptedFreelancer = proposal.freelancer;
  await project.save();

  await Proposal.updateMany(
    { project: project._id, _id: { $ne: proposal._id } },
    { status: 'rejected' }
  );

  await createNotification(
    proposal.freelancer,
    `Your proposal on "${project.title}" was accepted`,
    'contract',
    project._id
  );

  return proposal;
};

module.exports = {
  submitProposal,
  getFreelancerProposals,
  toggleSavedProject,
  getSavedProjects,
  getFreelancerStats,
  acceptProposal,
};
