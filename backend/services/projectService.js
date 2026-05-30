const Project = require('../models/Project');
const Proposal = require('../models/Proposal');
const SavedProject = require('../models/SavedProject');
const ApiError = require('../utils/ApiError');
const { createNotification, formatNotification } = require('./notificationService');

const formatProject = (p, extras = {}) => ({
  _id: p._id,
  id: p._id,
  title: p.title,
  description: p.description,
  budget: p.budget,
  status: mapStatusLabel(p.status),
  rawStatus: p.status,
  date: p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : '',
  proposals: extras.proposalCount ?? 0,
  client: extras.clientName || p.client?.name || 'Client',
  clientId: p.client?._id || p.client,
  distance: `${p.location?.distanceKm ?? 1} km`,
  desc: p.description,
  location: p.location,
  flaggedReason: p.flaggedReason,
  createdAt: p.createdAt,
  ...extras,
});

const mapStatusLabel = (status) => {
  const map = {
    open: 'Open',
    active: 'Active',
    under_review: 'Under Review',
    completed: 'Completed',
    flagged: 'Flagged',
    rejected: 'Rejected',
  };
  return map[status] || status;
};

const createProject = async (clientId, body) => {
  const { title, description, budget, city, distanceKm } = body;

  if (!title?.trim() || !budget) {
    throw new ApiError(400, 'Title and budget are required');
  }

  const project = await Project.create({
    title: title.trim(),
    description: description?.trim() || '',
    budget: Number(budget),
    client: clientId,
    location: {
      city: city?.trim() || 'Local',
      distanceKm: Number(distanceKm) || 1,
    },
    status: 'open',
  });

  await createNotification(
    clientId,
    `You successfully posted the project "${project.title}"`,
    'project',
    project._id
  );

  const populated = await Project.findById(project._id).populate('client', 'name username').lean();
  return formatProject(populated, { proposalCount: 0 });
};

const getClientProjects = async (clientId) => {
  const projects = await Project.find({ client: clientId, status: { $ne: 'rejected' } })
    .sort({ createdAt: -1 })
    .populate('client', 'name')
    .lean();

  const counts = await Proposal.aggregate([
    { $match: { project: { $in: projects.map((p) => p._id) } } },
    { $group: { _id: '$project', count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.count]));

  return projects.map((p) =>
    formatProject(p, { proposalCount: countMap[p._id.toString()] || 0, clientName: p.client?.name })
  );
};

const getBrowseProjects = async (freelancerId, search = '') => {
  const filter = { status: 'open' };
  if (search.trim()) {
    filter.$or = [
      { title: { $regex: search.trim(), $options: 'i' } },
      { description: { $regex: search.trim(), $options: 'i' } },
    ];
  }

  const projects = await Project.find(filter)
    .sort({ createdAt: -1 })
    .populate('client', 'name')
    .lean();

  const [proposals, savedIds] = await Promise.all([
    Proposal.find({ freelancer: freelancerId, project: { $in: projects.map((p) => p._id) } }).lean(),
    SavedProject.find({ freelancer: freelancerId, project: { $in: projects.map((p) => p._id) } }).lean(),
  ]);

  const proposalMap = Object.fromEntries(proposals.map((p) => [p.project.toString(), p]));
  const savedSet = new Set(savedIds.map((s) => s.project.toString()));

  return projects.map((p) => {
    const prop = proposalMap[p._id.toString()];
    return {
      ...formatProject(p, { clientName: p.client?.name }),
      saved: savedSet.has(p._id.toString()),
      applied: !!prop,
      proposalId: prop?._id,
      proposalStatus: prop?.status,
    };
  });
};

const getClientContracts = async (clientId) => {
  const projects = await Project.find({
    client: clientId,
    status: { $in: ['active', 'completed'] },
    acceptedFreelancer: { $ne: null },
  })
    .populate('acceptedFreelancer', 'name')
    .lean();

  return projects.map((p) => ({
    id: p._id,
    _id: p._id,
    title: p.title,
    freelancer: p.acceptedFreelancer?.name || 'Freelancer',
    value: p.budget,
    progress: p.status === 'completed' ? 100 : 75,
    status: mapStatusLabel(p.status),
  }));
};

const flagProject = async (projectId, userId, reason) => {
  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, 'Project not found');

  project.status = 'flagged';
  project.flaggedReason = reason || 'Community report';
  await project.save();
  return formatProject(project.toObject());
};

module.exports = {
  createProject,
  getClientProjects,
  getBrowseProjects,
  getClientContracts,
  flagProject,
  formatProject,
  mapStatusLabel,
};
