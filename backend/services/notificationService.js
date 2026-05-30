const Notification = require('../models/Notification');

const createNotification = async (userId, text, type = 'info', relatedProject = null) => {
  return Notification.create({
    user: userId,
    text,
    type,
    relatedProject,
  });
};

const getUserNotifications = async (userId) => {
  return Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
};

const markAllRead = async (userId) => {
  await Notification.updateMany({ user: userId, read: false }, { read: true });
};

const formatNotification = (n) => ({
  _id: n._id,
  text: n.text,
  read: n.read,
  type: n.type,
  time: formatRelativeTime(n.createdAt),
  createdAt: n.createdAt,
});

const formatRelativeTime = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAllRead,
  formatNotification,
};
