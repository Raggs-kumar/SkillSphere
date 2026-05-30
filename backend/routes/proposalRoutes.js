const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  submitProposal,
  getMyProposals,
  toggleSaved,
  getSaved,
  getStats,
  acceptProposal,
} = require('../controllers/proposalController');

router.get('/stats', protect, authorize('freelancer'), getStats);
router.get('/mine', protect, authorize('freelancer'), getMyProposals);
router.get('/saved', protect, authorize('freelancer'), getSaved);
router.post('/', protect, authorize('freelancer'), submitProposal);
router.post('/saved/:projectId', protect, authorize('freelancer'), toggleSaved);
router.patch('/:id/accept', protect, authorize('client'), acceptProposal);

module.exports = router;
