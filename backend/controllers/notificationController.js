const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/sendResponse');
const {
  getUserNotifications,
  markAllRead,
  formatNotification,
} = require('../services/notificationService');

const listNotifications = asyncHandler(async (req, res) => {
  const notifications = await getUserNotifications(req.user._id);
  sendSuccess(res, notifications.map(formatNotification));
});

const markNotificationsRead = asyncHandler(async (req, res) => {
  await markAllRead(req.user._id);
  sendSuccess(res, { message: 'All notifications marked as read' });
});

module.exports = { listNotifications, markNotificationsRead };
