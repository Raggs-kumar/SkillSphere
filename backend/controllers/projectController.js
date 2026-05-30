const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/sendResponse');
const projectService = require('../services/projectService');

const createProject = asyncHandler(async (req, res) => {
  const project = await projectService.createProject(req.user._id, req.body);
  sendSuccess(res, project, 201);
});

const getMyProjects = asyncHandler(async (req, res) => {
  const projects = await projectService.getClientProjects(req.user._id);
  sendSuccess(res, projects);
});

const browseProjects = asyncHandler(async (req, res) => {
  const projects = await projectService.getBrowseProjects(req.user._id, req.query.search);
  sendSuccess(res, projects);
});

const getMyContracts = asyncHandler(async (req, res) => {
  const contracts = await projectService.getClientContracts(req.user._id);
  sendSuccess(res, contracts);
});

module.exports = { createProject, getMyProjects, browseProjects, getMyContracts };
