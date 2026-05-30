const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createProject,
  getMyProjects,
  browseProjects,
  getMyContracts,
} = require('../controllers/projectController');

router.post('/', protect, authorize('client'), createProject);
router.get('/mine', protect, authorize('client'), getMyProjects);
router.get('/contracts', protect, authorize('client'), getMyContracts);
router.get('/browse', protect, authorize('freelancer'), browseProjects);

module.exports = router;
