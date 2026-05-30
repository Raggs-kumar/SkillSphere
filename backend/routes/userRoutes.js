const express = require('express');
const { getProfile, updateProfile, getAllUsers } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Profile routes
router.route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);

// Admin-only user list route
router.route('/')
  .get(protect, authorize('admin'), getAllUsers);

module.exports = router;
