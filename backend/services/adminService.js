const User = require('../models/User');
const Project = require('../models/Project');
const Proposal = require('../models/Proposal');
const ApiError = require('../utils/ApiError');

const getAdminStats = async () => {
  const [totalUsers, freelancerCount, clientCount, adminCount, activeProjects, flaggedProjects] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'freelancer' }),
      User.countDocuments({ role: 'client' }),
      User.countDocuments({ role: 'admin' }),
      Project.countDocuments({ status: { $in: ['open', 'active', 'under_review'] } }),
      Project.countDocuments({ status: 'flagged' }),
    ]);

  const revenueAgg = await Proposal.aggregate([
    { $match: { status: 'accepted' } },
    { $group: { _id: null, total: { $sum: '$bidAmount' } } },
  ]);

  const totalRevenue = revenueAgg[0]?.total || 0;
  const platformFees = Number((totalRevenue * 0.1).toFixed(2));

  return {
    totalUsers,
    freelancerCount,
    clientCount,
    adminCount,
    activeProjects,
    flaggedCount: flaggedProjects,
    totalRevenue,
    platformFees,
  };
};

const getFlaggedProjects = async () => {
  const projects = await Project.find({ status: 'flagged' })
    .sort({ updatedAt: -1 })
    .populate('client', 'name')
    .lean();

  return projects.map((p) => ({
    id: p._id,
    _id: p._id,
    title: p.title,
    client: p.client?.name || 'Unknown',
    reason: p.flaggedReason || 'Flagged for review',
    date: new Date(p.updatedAt).toISOString().split('T')[0],
  }));
};

const approveProject = async (projectId) => {
  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, 'Project not found');
  project.status = 'open';
  project.flaggedReason = '';
  await project.save();
  return project;
};

const rejectProject = async (projectId) => {
  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, 'Project not found');
  project.status = 'rejected';
  await project.save();
  await Proposal.deleteMany({ project: projectId });
  return project;
};

module.exports = {
  getAdminStats,
  getFlaggedProjects,
  approveProject,
  rejectProject,
};
