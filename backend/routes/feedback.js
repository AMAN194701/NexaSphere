const express = require('express');
const router = express.Router();
const {
  generateReport,
  getUserReports,
  getReportById
} = require('../controllers/feedbackController');
const protect = require('../middleware/authMiddleware');

router.post('/report/:sessionId', protect, generateReport);
router.get('/reports', protect, getUserReports);
router.get('/report/:reportId', protect, getReportById);

module.exports = router;