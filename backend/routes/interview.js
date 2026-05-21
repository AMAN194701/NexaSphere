const express = require('express');
const router = express.Router();
const {
  startSession,
  submitAnswer,
  completeSession,
  getUserSessions
} = require('../controllers/interviewController');
const protect = require('../middleware/authMiddleware'); // your existing auth middleware

router.post('/start', protect, startSession);
router.post('/submit-answer', protect, submitAnswer);
router.put('/complete/:sessionId', protect, completeSession);
router.get('/sessions', protect, getUserSessions);

module.exports = router;