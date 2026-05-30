const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/sendResponse');
const formatUser = require('../utils/formatUser');
const userService = require('../services/userService');

const getProfile = asyncHandler(async (req, res) => {
  sendSuccess(res, formatUser(req.user));
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user, req.body);
  sendSuccess(res, user);
});

const getAllUsers = asyncHandler(async (req, res) => {
  const { users, meta } = await userService.getAllUsers(req.query);
  sendSuccess(res, users, 200, meta);
});

module.exports = { getProfile, updateProfile, getAllUsers };
