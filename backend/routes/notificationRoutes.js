const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { listNotifications, markNotificationsRead } = require('../controllers/notificationController');

router.get('/', protect, listNotifications);
router.patch('/read-all', protect, markNotificationsRead);

module.exports = router;
