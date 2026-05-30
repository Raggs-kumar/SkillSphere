const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/sendResponse');
const adminService = require('../services/adminService');

const getStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getAdminStats();
  sendSuccess(res, stats);
});

const getFlaggedProjects = asyncHandler(async (req, res) => {
  const projects = await adminService.getFlaggedProjects();
  sendSuccess(res, projects);
});

const approveProject = asyncHandler(async (req, res) => {
  await adminService.approveProject(req.params.id);
  sendSuccess(res, { message: 'Project approved and restored to feed' });
});

const rejectProject = asyncHandler(async (req, res) => {
  await adminService.rejectProject(req.params.id);
  sendSuccess(res, { message: 'Project rejected and removed' });
});

module.exports = { getStats, getFlaggedProjects, approveProject, rejectProject };
