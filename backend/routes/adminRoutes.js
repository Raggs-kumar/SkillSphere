const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getStats,
  getFlaggedProjects,
  approveProject,
  rejectProject,
} = require('../controllers/adminController');

router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/projects/flagged', getFlaggedProjects);
router.patch('/projects/:id/approve', approveProject);
router.patch('/projects/:id/reject', rejectProject);

module.exports = router;
