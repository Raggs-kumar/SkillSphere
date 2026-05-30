const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/sendResponse');
const authService = require('../services/authService');

const registerUser = asyncHandler(async (req, res) => {
  const data = await authService.registerUser(req.body);
  sendSuccess(res, data, 201);
});

const loginUser = asyncHandler(async (req, res) => {
  const data = await authService.loginUser(req.body);
  sendSuccess(res, data);
});

module.exports = { registerUser, loginUser };
